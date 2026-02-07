const { MongoClient } = require("mongodb");

const generateLast12MonthsData = async (collection) => {
  const last12Months = [];
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + 1);

  for (let i = 11; i >= 0; i--) {
    const endDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() - i * 28
    );
    const startDate = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate() - 28
    );

    const monthYear = endDate.toLocaleString("default", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const count = await collection.countDocuments({
      createdAt: { $gte: startDate, $lt: endDate },
    });

    last12Months.push({ month: monthYear, count });
  }

  return { last12Months };
};

// Usage Example
// (async () => {
//   const client = new MongoClient(process.env.MONGO_URI);
//   await client.connect();
//   const db = client.db("yourDatabase");
//   const collection = db.collection("yourCollection");

//   const data = await generateLast12MonthsData(collection);
//   console.log(data);

//   await client.close();
// })();

module.exports = generateLast12MonthsData;
