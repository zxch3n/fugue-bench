import { runBenchmarks, writeBenchmarkResultsToFile } from '../../js-lib/index.js';
import { AutomergeFactory } from './factory.js';

;(async () => {
  await runBenchmarks(new AutomergeFactory(), testName => !(testName.startsWith("[B4x100") || testName.startsWith("[B4.")))
  writeBenchmarkResultsToFile('../results.json', testName => true)
})()
