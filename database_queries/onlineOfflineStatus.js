const Prisma_Client = require("../prisma_client/_prisma");
const prisma = Prisma_Client.prismaClient;

function updateOnlineStatus(id) {
    return prisma.users.update({
        where: {
            user_id: id,
        },
        data: {
            online_status: true,
            online_status_time: new Date(),
        },
    });
};

function updateOfflineStatus(id) {
    return prisma.users.update({
        where: {
            user_id: id,
        },
        data: {
            online_status: false,
            online_status_time: new Date(),
        },
    });
};

module.exports = { updateOnlineStatus, updateOfflineStatus };