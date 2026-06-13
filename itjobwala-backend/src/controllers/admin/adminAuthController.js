import bcrypt from 'bcrypt';
import Admin from '../../models/admin/Admin.js';
import {
  generateAccessToken,
  generateRefreshToken,
  storeRefreshToken,
} from '../../utils/tokenService.js';

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

export const adminLogin = async (request, reply) => {
  const { email, password } = request.body;
  try {
    const admin = await Admin.query().findOne({ email });

    // Generic message — never reveal whether the account exists
    if (!admin) {
      return reply.status(401).send({ success: false, message: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      return reply.status(401).send({ success: false, message: 'Invalid credentials' });
    }

    const accessToken  = generateAccessToken({ sub: admin.id, role: 'admin' });
    const refreshToken = generateRefreshToken({ sub: admin.id, role: 'admin' });

    await storeRefreshToken({
      userId:    admin.id,
      role:      'admin',
      token:     refreshToken,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    });

    setRefreshCookie(reply, refreshToken);

    return reply.status(200).send({
      success: true,
      message: 'Admin signed in',
      token:   accessToken,
      data: {
        id:        admin.id,
        email:     admin.email,
        full_name: admin.full_name,
      },
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};

export const adminMe = async (request, reply) => {
  try {
    const admin = await Admin.query()
      .select('id', 'email', 'full_name', 'created_at')
      .findById(request.user.id);

    if (!admin) {
      return reply.status(404).send({ success: false, message: 'Admin not found' });
    }

    return reply.status(200).send({ success: true, message: 'OK', data: admin });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
};
