import Conversation from '../../models/chat/Conversation.js';
import Message      from '../../models/chat/Message.js';
import User         from '../../models/candidate/User.js';
import Recruiter    from '../../models/recruiter/Recruiter.js';

export const getConversations = async (request, reply) => {
  try {
    const userId = request.user.id;
    const role   = request.user.role ?? 'candidate';

    let conversations;
    if (role === 'candidate') {
      conversations = await Conversation.query()
        .where('candidate_id', userId)
        .orderBy('last_message_at', 'desc')
        .limit(50);
    } else {
      conversations = await Conversation.query()
        .where('recruiter_id', userId)
        .orderBy('last_message_at', 'desc')
        .limit(50);
    }

    const enriched = await Promise.all(conversations.map(async conv => {
      // Get the other party info
      let otherParty = null;
      if (role === 'candidate') {
        const r = await Recruiter.query().findById(conv.recruiter_id).select('id', 'full_name', 'company_name', 'logo');
        otherParty = r ? { id: r.id, name: r.full_name, subtitle: r.company_name, photo: r.logo ?? null, role: 'recruiter' } : null;
      } else {
        const u = await User.query().findById(conv.candidate_id).select('id', 'full_name', 'title', 'profile_photo_url');
        otherParty = u ? { id: u.id, name: u.full_name, subtitle: u.title, photo: u.profile_photo_url, role: 'candidate' } : null;
      }

      const otherRole   = role === 'candidate' ? 'recruiter' : 'candidate';
      const unreadCount = await Message.query()
        .where('conversation_id', conv.id)
        .where('is_read', false)
        .where('sender_role', otherRole)
        .resultSize();

      return {
        id:              conv.id,
        last_message:    conv.last_message,
        last_message_at: conv.last_message_at,
        unread_count:    unreadCount,
        other_party:     otherParty,
        created_at:      conv.created_at,
      };
    }));

    return reply.send({
      success: true,
      message: 'Conversations fetched.',
      data:    { conversations: enriched },
    });
  } catch (err) {
    throw err;
  }
};

export const getOrCreateConversation = async (request, reply) => {
  try {
    const userId = request.user.id;
    const role   = request.user.role ?? 'candidate';
    const { other_id, referral_request_id } = request.body;

    // Only recruiters can initiate new conversations.
    // Candidates can only open conversations that already exist.
    if (role === 'candidate') {
      const conv = await Conversation.query().findOne({
        candidate_id: userId,
        recruiter_id: other_id,
      });
      if (!conv) {
        return reply.status(403).send({
          success: false,
          message: 'Candidates cannot initiate conversations. Wait for a recruiter to message you first.',
        });
      }
      return reply.send({
        success: true,
        message: 'Conversation ready.',
        data:    { conversation_id: conv.id },
      });
    }

    // Recruiter flow: find or create
    let conv = await Conversation.query().findOne({
      candidate_id: other_id,
      recruiter_id: userId,
    });
    if (!conv) {
      conv = await Conversation.query().insertAndFetch({
        candidate_id:        other_id,
        recruiter_id:        userId,
        referral_request_id: referral_request_id ?? null,
        last_message_at:     new Date().toISOString(),
      });
    }

    return reply.send({
      success: true,
      message: 'Conversation ready.',
      data:    { conversation_id: conv.id },
    });
  } catch (err) {
    throw err;
  }
};
