const { pool } = require("../../../config/database");

// 일정생성
async function insertscheduleInfo(insertscheduleParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const insertscheduleQuery = `
  insert into schedule(userID, scheduleName, scheduleDate,
    scheduleCategoryID, scheduleMemo, scheduleStatus,
    scheduleDelete,scheduleCreatedAt,scheduleUpdatedAt,schedulePick)
    values(?,?,?,?,?,default,default,default,default
           ,default)
  `;

  const [insertschedulerows] = await connection.query(
    insertscheduleQuery,
    insertscheduleParams
  );
  connection.release();

  return  insertschedulerows;
}

module.exports = {
  insertscheduleInfo
};
