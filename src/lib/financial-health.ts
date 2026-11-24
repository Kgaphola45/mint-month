import {
  FinancialHealthGrade,
  FinancialHealthScoreSummary,
  HealthPillarAssessment,
  HealthScoreRecommendation,
} from "@/types";

export interface ComputeHealthScoreParams {
  monthIncome: number;
  savingsMonthly: number;
  emergencyFundTotal: number;
  debtMonthly: number;
  debitOrdersMonthly: number;
  subscriptionsMonthly: number;
  totalBudget: number;
  totalSpent: number;
  isIncomeSet: boolean;
  hasPaydayDay: boolean;
  currencySymbol?: string;
}

export function computeFinancialHealthScore(
  params: ComputeHealthScoreParams
): FinancialHealthScoreSummary {
  const {
    monthIncome = 25000,
    savingsMonthly = 0,
    emergencyFundTotal = 0,
    debtMonthly = 0,
    debitOrdersMonthly = 0,
    subscriptionsMonthly = 0,
    totalBudget = 0,
    totalSpent = 0,
    isIncomeSet = false,
    hasPaydayDay = false,
    currencySymbol = "R",
  } = params;

  const income = Math.max(monthIncome, 1);
  const pillars: HealthPillarAssessment[] = [];

  // 1. Savings Rate (Max 20 pts)
  const savingsRate = Math.round((savingsMonthly / income) * 1000) / 10;
  let savingsScore = 0;
  let savingsStatus = "Zero Savings";
  let savingsTier: "healthy" | "warning" | "critical" = "critical";
  let savingsPrescription = "";
  let savingsGain = 0;

  if (savingsRate >= 20) {
    savingsScore = 20;
    savingsStatus = "Optimal";
    savingsTier = "healthy";
    savingsPrescription = "You are saving 20%+ of your take-home pay, meeting the top wealth-building benchmark.";
    savingsGain = 0;
  } else if (savingsRate >= 15) {
    savingsScore = 16;
    savingsStatus = "Strong";
    savingsTier = "healthy";
    savingsPrescription = `Bump savings by ${currencySymbol}${Math.round(income * 0.05).toLocaleString()} to reach 20% and max out this pillar.`;
    savingsGain = 4;
  } else if (savingsRate >= 10) {
    savingsScore = 12;
    savingsStatus = "Moderate";
    savingsTier = "warning";
    savingsPrescription = `Ring-fence an additional ${currencySymbol}${Math.round(income * 0.05).toLocaleString()}/mo in a savings vault to cross 15%.`;
    savingsGain = 4;
  } else if (savingsRate >= 5) {
    savingsScore = 7;
    savingsStatus = "Building";
    savingsTier = "warning";
    savingsPrescription = `Increase monthly savings contributions by ${currencySymbol}${Math.round(income * 0.05).toLocaleString()} to reach 10%.`;
    savingsGain = 5;
  } else if (savingsRate > 0) {
    savingsScore = 3;
    savingsStatus = "Starting";
    savingsTier = "critical";
    savingsPrescription = `Automate a regular debit order into your savings vaults to reach at least 5% (${currencySymbol}${Math.round(income * 0.05).toLocaleString()}).`;
    savingsGain = 4;
  } else {
    savingsScore = 0;
    savingsStatus = "No Active Savings";
    savingsTier = "critical";
    savingsPrescription = `Set up an Emergency Fund or Stokvel vault to begin ring-fencing monthly contributions.`;
    savingsGain = 7;
  }

  pillars.push({
    id: "savings_rate",
    title: "Savings Rate",
    score: savingsScore,
    maxScore: 20,
    percentage: Math.round((savingsScore / 20) * 100),
    metricValue: `${savingsRate.toFixed(1)}% of income`,
    statusLabel: savingsStatus,
    statusTier: savingsTier,
    prescription: savingsPrescription,
    potentialPointsGain: savingsGain,
  });

  // 2. Debt-to-Income (DTI) Ratio (Max 20 pts)
  const dti = Math.round((debtMonthly / income) * 1000) / 10;
  let dtiScore = 0;
  let dtiStatus = "Debt Free";
  let dtiTier: "healthy" | "warning" | "critical" = "healthy";
  let dtiPrescription = "";
  let dtiGain = 0;

  if (debtMonthly === 0) {
    dtiScore = 20;
    dtiStatus = "Debt Free";
    dtiTier = "healthy";
    dtiPrescription = "Zero monthly debt instalments. 100% of your earnings stay in your control.";
    dtiGain = 0;
  } else if (dti <= 15) {
    dtiScore = 18;
    dtiStatus = "Low Burden";
    dtiTier = "healthy";
    dtiPrescription = "Debt consumes under 15% of income, well below South African credit risk ceilings.";
    dtiGain = 2;
  } else if (dti <= 28) {
    dtiScore = 14;
    dtiStatus = "Manageable";
    dtiTier = "healthy";
    dtiPrescription = "Debt is within acceptable limits. Pay off smallest loan first to drop below 15%.";
    dtiGain = 4;
  } else if (dti <= 36) {
    dtiScore = 9;
    dtiStatus = "Elevated";
    dtiTier = "warning";
    dtiPrescription = "Debt payments take 29-36% of pay. Accelerate payoff of 1 contract to drop DTI below 28%.";
    dtiGain = 5;
  } else if (dti <= 45) {
    dtiScore = 4;
    dtiStatus = "High Stress";
    dtiTier = "critical";
    dtiPrescription = "Heavy debt burden (37-45%). Avoid taking on any new accounts and apply the debt snowball method.";
    dtiGain = 5;
  } else {
    dtiScore = 1;
    dtiStatus = "Critical DTI";
    dtiTier = "critical";
    dtiPrescription = "Debt exceeds 45% of take-home pay. Prioritize debt restructuring or strict settlement focus.";
    dtiGain = 8;
  }

  pillars.push({
    id: "debt_to_income",
    title: "Debt-to-Income Ratio",
    score: dtiScore,
    maxScore: 20,
    percentage: Math.round((dtiScore / 20) * 100),
    metricValue: `${dti.toFixed(1)}% of income`,
    statusLabel: dtiStatus,
    statusTier: dtiTier,
    prescription: dtiPrescription,
    potentialPointsGain: dtiGain,
  });

  // 3. Emergency Fund Coverage (Max 20 pts)
  const essentialMonthly = Math.max(
    debitOrdersMonthly +
      subscriptionsMonthly +
      debtMonthly +
      (totalBudget > 0 ? totalBudget * 0.6 : income * 0.45),
    3000
  );
  const emergencyMonths = Math.round((emergencyFundTotal / essentialMonthly) * 10) / 10;
  let efScore = 0;
  let efStatus = "Unprotected";
  let efTier: "healthy" | "warning" | "critical" = "critical";
  let efPrescription = "";
  let efGain = 0;

  if (emergencyMonths >= 6) {
    efScore = 20;
    efStatus = "Fortified";
    efTier = "healthy";
    efPrescription = "6+ months of living costs saved in your Emergency Vault. You have fortress antifragility.";
    efGain = 0;
  } else if (emergencyMonths >= 3) {
    efScore = 16;
    efStatus = "Solid Cushion";
    efTier = "healthy";
    efPrescription = `You have ${emergencyMonths} months banked. Add ${currencySymbol}${Math.round(essentialMonthly * (6 - emergencyMonths)).toLocaleString()} to reach a 6-month vault.`;
    efGain = 4;
  } else if (emergencyMonths >= 1) {
    efScore = 11;
    efStatus = "Starter Buffer";
    efTier = "warning";
    efPrescription = `You have ${emergencyMonths} mo of cushion. Boost this vault to 3 full months (${currencySymbol}${Math.round(essentialMonthly * 3).toLocaleString()}) to handle major emergencies.`;
    efGain = 5;
  } else if (emergencyMonths >= 0.5) {
    efScore = 5;
    efStatus = "Thin Buffer";
    efTier = "warning";
    efPrescription = `Cushion covers under 1 month. Ring-fence an extra ${currencySymbol}1,000/mo until you reach a full 1-month buffer.`;
    efGain = 6;
  } else {
    efScore = 0;
    efStatus = "Unprotected";
    efTier = "critical";
    efPrescription = `No liquid emergency vault. Create an Emergency Fund in Savings Vaults to prevent high-interest borrowing during a shock.`;
    efGain = 11;
  }

  pillars.push({
    id: "emergency_fund",
    title: "Emergency Cushion",
    score: efScore,
    maxScore: 20,
    percentage: Math.round((efScore / 20) * 100),
    metricValue: `${emergencyMonths.toFixed(1)} months covered`,
    statusLabel: efStatus,
    statusTier: efTier,
    prescription: efPrescription,
    potentialPointsGain: efGain,
  });

  // 4. Budget Adherence (Max 15 pts)
  let budgetScore = 8;
  let budgetStatus = "Unbudgeted";
  let budgetTier: "healthy" | "warning" | "critical" = "warning";
  let budgetPrescription = "Set category caps in Budgets to activate precise adherence tracking.";
  let budgetGain = 7;
  let budgetRate = 0;

  if (totalBudget > 0) {
    budgetRate = Math.round((totalSpent / totalBudget) * 100);
    if (budgetRate <= 85) {
      budgetScore = 15;
      budgetStatus = "Flawless";
      budgetTier = "healthy";
      budgetPrescription = "Spending is comfortably under budget caps, leaving maximum cash surplus.";
      budgetGain = 0;
    } else if (budgetRate <= 100) {
      budgetScore = 13;
      budgetStatus = "On Track";
      budgetTier = "healthy";
      budgetPrescription = "Total spending is on track within monthly budget caps.";
      budgetGain = 2;
    } else if (budgetRate <= 110) {
      budgetScore = 7;
      budgetStatus = "Slight Slip";
      budgetTier = "warning";
      budgetPrescription = `Spending is ${budgetRate - 100}% over budget. Trim discretionary dining or leisure to bring totals back in line.`;
      budgetGain = 6;
    } else {
      budgetScore = 2;
      budgetStatus = "Overbudget";
      budgetTier = "critical";
      budgetPrescription = `Spending exceeded budget by ${budgetRate - 100}%. Check category limits and cut variable outlays until next payday.`;
      budgetGain = 11;
    }
  }

  pillars.push({
    id: "budget_adherence",
    title: "Budget Adherence",
    score: budgetScore,
    maxScore: 15,
    percentage: Math.round((budgetScore / 15) * 100),
    metricValue: totalBudget > 0 ? `${budgetRate}% used` : "No limits set",
    statusLabel: budgetStatus,
    statusTier: budgetTier,
    prescription: budgetPrescription,
    potentialPointsGain: budgetGain,
  });

  // 5. Upcoming Financial Commitments (Max 15 pts)
  const totalCommitted = debitOrdersMonthly + subscriptionsMonthly + debtMonthly;
  const committedRatio = Math.round((totalCommitted / income) * 1000) / 10;
  let commScore = 0;
  let commStatus = "High Flexibility";
  let commTier: "healthy" | "warning" | "critical" = "healthy";
  let commPrescription = "";
  let commGain = 0;

  if (committedRatio <= 35) {
    commScore = 15;
    commStatus = "High Flexibility";
    commTier = "healthy";
    commPrescription = "Only 35% or less locked in recurring costs. Excellent discretionary agility.";
    commGain = 0;
  } else if (committedRatio <= 50) {
    commScore = 12;
    commStatus = "Balanced";
    commTier = "healthy";
    commPrescription = "36-50% committed. Healthy South African baseline between fixed outlays and living room.";
    commGain = 3;
  } else if (committedRatio <= 65) {
    commScore = 7;
    commStatus = "Heavy Load";
    commTier = "warning";
    commPrescription = "51-65% locked in recurring commitments. Audit subscriptions and debit orders to release breathing room.";
    commGain = 5;
  } else {
    commScore = 2;
    commStatus = "Squeezed";
    commTier = "critical";
    commPrescription = "Over 65% of income locked before everyday expenses. Cancel forgotten subscriptions and review bills.";
    commGain = 10;
  }

  pillars.push({
    id: "commitments",
    title: "Committed Fixed Costs",
    score: commScore,
    maxScore: 15,
    percentage: Math.round((commScore / 15) * 100),
    metricValue: `${committedRatio.toFixed(1)}% of income`,
    statusLabel: commStatus,
    statusTier: commTier,
    prescription: commPrescription,
    potentialPointsGain: commGain,
  });

  // 6. Income Stability (Max 10 pts)
  let stabilityScore = 3;
  let stabilityStatus = "Estimated";
  let stabilityTier: "healthy" | "warning" | "critical" = "warning";
  let stabilityPrescription = "Lock in your take-home pay and payday day in your Profile Drawer to establish runway stability.";
  let stabilityGain = 7;

  if (isIncomeSet && hasPaydayDay) {
    stabilityScore = 10;
    stabilityStatus = "Stable";
    stabilityTier = "healthy";
    stabilityPrescription = "Take-home income and recurring payday date are confirmed. Runway projections are accurate.";
    stabilityGain = 0;
  } else if (isIncomeSet) {
    stabilityScore = 7;
    stabilityStatus = "Configured";
    stabilityTier = "healthy";
    stabilityPrescription = "Salary is set. Add your regular monthly payday day in your profile to complete stability tracking.";
    stabilityGain = 3;
  }

  pillars.push({
    id: "income_stability",
    title: "Income Stability",
    score: stabilityScore,
    maxScore: 10,
    percentage: Math.round((stabilityScore / 10) * 100),
    metricValue: isIncomeSet ? `${currencySymbol}${Math.round(income).toLocaleString()}/mo` : "Estimated",
    statusLabel: stabilityStatus,
    statusTier: stabilityTier,
    prescription: stabilityPrescription,
    potentialPointsGain: stabilityGain,
  });

  // Overall Score & Grade
  const overallScore = Math.min(
    100,
    Math.max(0, pillars.reduce((acc, p) => acc + p.score, 0))
  );

  let grade: FinancialHealthGrade = "Moderate";
  let tierNumber = 3;
  let headline = "";
  let summaryText = "";

  if (overallScore >= 85) {
    grade = "Excellent";
    tierNumber = 1;
    headline = "Fortress Antifragility";
    summaryText = "Your finances demonstrate strong savings discipline, low debt, and healthy reserves. You are well on the path to long-term wealth independence.";
  } else if (overallScore >= 70) {
    grade = "Resilient";
    tierNumber = 2;
    headline = "Solid Financial Health";
    summaryText = "Your fundamentals are sound and resilient against regular shocks. Optimizing emergency reserves and trimming small recurring leaks will elevate you to Tier 1.";
  } else if (overallScore >= 50) {
    grade = "Moderate";
    tierNumber = 3;
    headline = "Cautious / In Transition";
    summaryText = "You are staying afloat, but debt instalments or thin emergency savings create vulnerabilities. Following your action plan will safeguard you against unexpected shocks.";
  } else {
    grade = "Vulnerable";
    tierNumber = 4;
    headline = "Immediate Attention Required";
    summaryText = "High debt ratios, unbuffered emergencies, or budget slippage place your cash flow under extreme pressure. Focus on your top 3 recovery actions immediately.";
  }

  // Top Recommendations
  const actionablePillars = [...pillars]
    .filter((p) => p.potentialPointsGain > 0)
    .sort((a, b) => b.potentialPointsGain - a.potentialPointsGain);

  const topRecommendations: HealthScoreRecommendation[] = actionablePillars.slice(0, 3).map((p) => {
    let anchor = "";
    let title = "";
    switch (p.id) {
      case "savings_rate":
        anchor = "#savings-vaults";
        title = "Boost Monthly Savings Rate";
        break;
      case "debt_to_income":
        anchor = "#debt-tracker";
        title = "Accelerate Debt Snowball Paydown";
        break;
      case "emergency_fund":
        anchor = "#savings-vaults";
        title = "Expand Emergency Cushion";
        break;
      case "budget_adherence":
        anchor = "/budgets";
        title = "Enforce Category Spending Caps";
        break;
      case "commitments":
        anchor = "#subscriptions";
        title = "Audit Subscriptions & Fixed Bills";
        break;
      case "income_stability":
        anchor = "profile";
        title = "Lock in Verified Take-Home Pay";
        break;
    }

    return {
      id: `rec-${p.id}`,
      pillarId: p.id,
      title,
      actionText: p.prescription,
      pointsBoost: p.potentialPointsGain,
      targetAnchor: anchor,
    };
  });

  return {
    overallScore,
    maxScore: 100,
    grade,
    tierNumber,
    headline,
    summaryText,
    pillars,
    topRecommendations,
    savingsRatePercent: savingsRate,
    debtToIncomePercent: dti,
    emergencyFundMonths: emergencyMonths,
    budgetAdherencePercent: budgetRate,
    commitmentsRatioPercent: committedRatio,
    isIncomeStable: isIncomeSet && hasPaydayDay,
  };
}
