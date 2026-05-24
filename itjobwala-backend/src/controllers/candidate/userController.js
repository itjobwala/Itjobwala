import bcrypt from 'bcrypt';
import dns from 'dns';
import User from '../../models/candidate/User.js';
import { generateAccessToken, generateRefreshToken, storeRefreshToken } from '../../utils/tokenService.js';

const resolveMx = dns.promises.resolveMx;

const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

function setRefreshCookie(reply, token) {
  reply.setCookie('refresh_token', token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path:     '/',
    maxAge:   REFRESH_COOKIE_MAX_AGE,
  });
}

export const candidateRegister = async (request, reply) => {
  const { full_name, email, mobile, password, work_status, terms_accepted } = request.body;

  try {
    if (email) {
      const domain = email.split('@')[1];
      try {
        const mxRecords = await resolveMx(domain);
        if (!mxRecords || mxRecords.length === 0) {
          return reply.status(400).send({ success: false, message: 'Invalid email domain. Please provide a valid email address.' });
        }
      } catch (err) {
        return reply.status(400).send({ success: false, message: 'Invalid email domain. Please provide a valid email address.' });
      }
    }
    const existingEmail = await User.query().findOne({ email });
    if (existingEmail) {
      return reply.status(409).send({ success: false, message: 'Email already exists' });
    }

    const existingMobile = await User.query().findOne({ mobile });
    if (existingMobile) {
      return reply.status(409).send({ success: false, message: 'Mobile number already exists' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await User.query().insert({
      full_name,
      email,
      mobile,
      password: hashedPassword,
      work_status,
      terms_accepted
    }).returning('*');

    delete newUser.password;

    return reply.status(201).send({
      success: true,
      message: 'User registered successfully'
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const candidateSignin = async (request, reply) => {
  const { email, mobile, password } = request.body;

  try {
    if (email) {
      const domain = email.split('@')[1];
      try {
        const mxRecords = await resolveMx(domain);
        if (!mxRecords || mxRecords.length === 0) {
          return reply.status(400).send({ success: false, message: 'Invalid email domain. Please provide a valid email address.' });
        }
      } catch (err) {
        return reply.status(400).send({ success: false, message: 'Invalid email domain. Please provide a valid email address.' });
      }
    }

    let query = {};
    if (email) query.email = email;
    else if (mobile) query.mobile = mobile;

    const user = await User.query().findOne(query);
    if (!user) {
      return reply.status(404).send({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return reply.status(401).send({ success: false, message: 'Invalid credentials' });
    }

    // Generate short-lived access token + long-lived refresh token
    const accessToken  = generateAccessToken({ sub: user.id, role: 'candidate' });
    const refreshToken = generateRefreshToken({ sub: user.id, role: 'candidate' });

    await storeRefreshToken({
      userId:    user.id,
      role:      'candidate',
      token:     refreshToken,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    });

    setRefreshCookie(reply, refreshToken);

    delete user.password;

    return reply.status(200).send({
      success: true,
      message: 'Signin successful',
      token:   accessToken,        // keep `token` field for frontend compat
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};
