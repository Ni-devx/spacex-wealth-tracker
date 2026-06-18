const fs = require('fs');
const path = require('path');

async function update() {
  try {
    const [spcxRes, jpyRes] = await Promise.all([
      fetch('https://query1.finance.yahoo.com/v8/finance/chart/SPCX'),
      fetch('https://query1.finance.yahoo.com/v8/finance/chart/JPY=X')
    ]);

    const spcxData = await spcxRes.json();
    const jpyData = await jpyRes.json();

    const spcxPrice = spcxData.chart.result[0].meta.regularMarketPrice;
    const jpyRate = jpyData.chart.result[0].meta.regularMarketPrice;

    const filePath = path.join(__dirname, '../public/history.json');
    const history = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    history.push({
      timestamp: new Date().toISOString(),
      spcxPrice,
      jpyRate
    });

    fs.writeFileSync(filePath, JSON.stringify(history, null, 2));
    console.log("Successfully updated history.json");
  } catch (error) {
    console.error("Failed to update history:", error);
  }
}

update();