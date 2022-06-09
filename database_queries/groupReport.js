const Prisma_Client = require("../prisma_client/_prisma");
const prisma = Prisma_Client.prismaClient;

function chkAlreadyReportedGroup(group_id, reporter_id) {
  return prisma.groupReports.findFirst({
    where: {
      reporter_id,
      group_id,
    },
  });
}

function reportGroup(group_id, reporter_id,report_reason) {
  return prisma.groupReports.create({
    data: {
      reporter_id,
      group_id,
      report_reason,
    },
  });
}

module.exports = { chkAlreadyReportedGroup,reportGroup };
