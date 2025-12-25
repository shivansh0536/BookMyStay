const prisma = require('../prisma');

/**
 * Creates an audit log entry
 * @param {string} userId - The ID of the user performing the action
 * @param {string} action - Short action code (e.g., 'USER_DELETED')
 * @param {string} details - Human readable details
 * @param {string} entityId - Optional ID of the affected entity
 */
const logAction = async (userId, action, details, entityId = null) => {
    try {
        await prisma.auditLog.create({
            data: {
                userId,
                action,
                details,
                entityId
            }
        });
    } catch (error) {
        console.error('Failed to create audit log:', error);
        // We don't throw here to avoid failing the main request just because logging failed
    }
};

module.exports = { logAction };
