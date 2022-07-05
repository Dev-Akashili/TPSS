import express from "express";
import bodyParser from "body-parser";

const app = express();
const router = express.Router();
const PORT = 5000;

app.use(bodyParser.json());

app.use("/split-payments/compute", router);

router.post("/", (req, res) => {
  const { ID, Amount, SplitInfo } = req.body;

  let Balance = Amount;

  const flats = [];
  const percentages = [];
  const ratios = [];
  const splitBreakdown = [];

  for (let i = 0; i < SplitInfo.length; i++) {
    let { SplitType } = SplitInfo[i];
    if (SplitType === "FLAT") {
      flats.push(SplitInfo[i]);
    } else if (SplitType === "PERCENTAGE") {
      percentages.push(SplitInfo[i]);
    } else if (SplitType === "RATIO") {
      ratios.push(SplitInfo[i]);
    }
  }

  if (flats) {
    for (let i = 0; i < flats.length; i++) {
      let { SplitValue } = flats[i];
      Balance -= SplitValue;
      const { SplitEntityId } = flats[i];
      const data = {
        SplitEntityId: SplitEntityId,
        Amount: SplitValue,
      };
      splitBreakdown.push(data);
    }
  }

  if (percentages) {
    for (let i = 0; i < percentages.length; i++) {
      let { SplitValue } = percentages[i];
      let SplitAmount = (SplitValue / 100) * Balance;
      Balance -= SplitAmount;
      const { SplitEntityId } = percentages[i];
      const data = {
        SplitEntityId: SplitEntityId,
        Amount: SplitAmount,
      };
      splitBreakdown.push(data);
    }
  }

  let totalRatio = 0;
  let amountForCalc = Balance;

  if (ratios) {
    for (let i = 0; i < ratios.length; i++) {
      let { SplitValue } = ratios[i];
      totalRatio += SplitValue;
    }
    for (let i = 0; i < ratios.length; i++) {
      let { SplitValue } = ratios[i];
      let RatioSplitAmount = (SplitValue / totalRatio) * amountForCalc;
      Balance -= RatioSplitAmount
      const { SplitEntityId } = ratios[i];
      const data = {
        SplitEntityId: SplitEntityId,
        Amount: RatioSplitAmount,
      };
      splitBreakdown.push(data);
    }
  }

  const response = {
    ID: ID,
    Balance: Balance,
    SplitBreakdown: splitBreakdown,
  };

  res.send(response);
});

app.listen(process.env.PORT || PORT, () => {
  console.log(`Server running on https://localhost:${PORT}`);
});