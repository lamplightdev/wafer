export default {
  coverageConfig: {
    reporters: ["html", "text"],
    report: true,
    reportDir: "coverage",

    threshold: {
      statements: 70,
      branches: 40,
      functions: 70,
      lines: 70,
    },
  },
};
