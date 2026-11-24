import { format, addMonths, differenceInMonths, parse } from "date-fns";
import {
  LifeGoal,
  LifeGoalCalculation,
  LifeGoalRoadmapSummary,
  GoalFeasibility,
} from "@/types";

export interface ComputeGoalRoadmapParams {
  goals: LifeGoal[];
  monthlyDiscretionaryCapacity: number; // safe to spend pool
  simulatedExtraSavings?: number; // slider extra savings simulation
}

export function computeGoalRoadmap(params: ComputeGoalRoadmapParams): LifeGoalRoadmapSummary {
  const {
    goals = [],
    monthlyDiscretionaryCapacity = 8000,
    simulatedExtraSavings = 500,
  } = params;

  const now = new Date();
  const calculatedGoals: LifeGoalCalculation[] = [];

  let totalTargetAmount = 0;
  let totalCurrentSaved = 0;
  let totalMonthlyRequired = 0;
  let realisticCount = 0;
  let moderateCount = 0;
  let stretchCount = 0;
  let unrealisticCount = 0;
  let activeCount = 0;
  let completedCount = 0;

  for (const goal of goals) {
    totalTargetAmount += goal.targetAmount;
    totalCurrentSaved += goal.currentSaved;

    const remainingAmount = Math.max(0, goal.targetAmount - goal.currentSaved);
    const progressPercent =
      goal.targetAmount > 0
        ? Math.min(100, Math.round((goal.currentSaved / goal.targetAmount) * 100))
        : 100;

    if (goal.isCompleted || remainingAmount <= 0) {
      completedCount++;
      calculatedGoals.push({
        goal,
        remainingAmount: 0,
        progressPercent: 100,
        monthsRemaining: 0,
        requiredMonthlySavings: 0,
        estimatedCompletionDate: "Completed",
        feasibility: "realistic",
        feasibilityLabel: "Goal Achieved",
        feasibilityColor: "healthy",
        feasibilityAdvice: "Congratulations! You have fully funded this life ambition.",
        impactOfExtraSavings: {
          extraAmount: simulatedExtraSavings,
          monthsSaved: 0,
          newCompletionDate: "Completed",
        },
      });
      continue;
    }

    activeCount++;

    // Calculate months remaining
    let monthsRemaining = 12;
    if (goal.targetDate) {
      try {
        const parsedTarget = parse(goal.targetDate, "yyyy-MM", now);
        const diff = differenceInMonths(parsedTarget, now);
        monthsRemaining = Math.max(1, diff);
      } catch {
        monthsRemaining = 12;
      }
    } else if (goal.monthlyContribution && goal.monthlyContribution > 0) {
      monthsRemaining = Math.max(1, Math.ceil(remainingAmount / goal.monthlyContribution));
    }

    const requiredMonthlySavings =
      goal.monthlyContribution && goal.monthlyContribution > 0
        ? goal.monthlyContribution
        : Math.ceil(remainingAmount / monthsRemaining);

    totalMonthlyRequired += requiredMonthlySavings;

    const estimatedDate = addMonths(now, monthsRemaining);
    const estimatedCompletionDate = format(estimatedDate, "MMM yyyy");

    // Realism & Feasibility Analysis
    let feasibility: GoalFeasibility = "realistic";
    let feasibilityLabel = "Comfortable";
    let feasibilityColor: "healthy" | "warning" | "critical" = "healthy";
    let feasibilityAdvice = "";

    const capacity = Math.max(0, monthlyDiscretionaryCapacity);

    if (capacity <= 0) {
      feasibility = "unrealistic";
      feasibilityLabel = "Deficit";
      feasibilityColor = "critical";
      feasibilityAdvice =
        "Fixed bills exceed current income. Trim subscriptions or debt to unlock discretionary savings.";
      unrealisticCount++;
    } else {
      const ratio = requiredMonthlySavings / capacity;
      if (ratio <= 0.35) {
        feasibility = "realistic";
        feasibilityLabel = "Comfortable";
        feasibilityColor = "healthy";
        feasibilityAdvice =
          "Well within your safe-to-spend buffer. You can fund this comfortably without living strain.";
        realisticCount++;
      } else if (ratio <= 0.65) {
        feasibility = "moderate";
        feasibilityLabel = "Achievable";
        feasibilityColor = "healthy";
        feasibilityAdvice =
          "Achievable with consistent discipline on variable dining out, entertainment, and leisure.";
        moderateCount++;
      } else if (ratio <= 0.9) {
        feasibility = "stretch";
        feasibilityLabel = "High Stretch";
        feasibilityColor = "warning";
        feasibilityAdvice =
          "Leaves tight daily living room. Consider extending target date by 3–6 months to lower monthly demand.";
        stretchCount++;
      } else {
        feasibility = "unrealistic";
        feasibilityLabel = "Exceeds Surplus";
        feasibilityColor = "critical";
        feasibilityAdvice =
          "Demands more than your monthly safe-to-spend pool. Extend target date or look for side income.";
        unrealisticCount++;
      }
    }

    // Impact of everyday spending adjustments (e.g. +R500/mo)
    const newMonthly = requiredMonthlySavings + simulatedExtraSavings;
    const newMonths = Math.max(1, Math.ceil(remainingAmount / newMonthly));
    const monthsSaved = Math.max(0, monthsRemaining - newMonths);
    const newDate = addMonths(now, newMonths);

    calculatedGoals.push({
      goal,
      remainingAmount,
      progressPercent,
      monthsRemaining,
      requiredMonthlySavings,
      estimatedCompletionDate,
      feasibility,
      feasibilityLabel,
      feasibilityColor,
      feasibilityAdvice,
      impactOfExtraSavings: {
        extraAmount: simulatedExtraSavings,
        monthsSaved,
        newCompletionDate: format(newDate, "MMM yyyy"),
      },
    });
  }

  const overallProgressPercent =
    totalTargetAmount > 0
      ? Math.min(100, Math.round((totalCurrentSaved / totalTargetAmount) * 100))
      : 0;

  const capacityUtilizationPercent =
    monthlyDiscretionaryCapacity > 0
      ? Math.round((totalMonthlyRequired / monthlyDiscretionaryCapacity) * 100)
      : 0;

  return {
    goals: calculatedGoals,
    totalTargetAmount,
    totalCurrentSaved,
    totalMonthlyRequired,
    overallProgressPercent,
    realisticCount,
    moderateCount,
    stretchCount,
    unrealisticCount,
    activeCount,
    completedCount,
    monthlySavingsCapacity: monthlyDiscretionaryCapacity,
    capacityUtilizationPercent,
  };
}
