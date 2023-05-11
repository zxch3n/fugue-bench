import {
  runBenchmarks,
  writeBenchmarkResultsToFile,
} from "../../js-lib/index.js";
import { CrdtRichtextFactory } from "./factory.js";

const skipped = ["[B1.8", "[B1.9", "[B1.10", "[B1.11", "[B3.4"];

(async () => {
  await runBenchmarks(new CrdtRichtextFactory(), (testName) =>
    skipped.reduce((acc, cur) => acc && !testName.startsWith(cur), true)
  );
  writeBenchmarkResultsToFile("../results.json", (testName) => true);
})();
