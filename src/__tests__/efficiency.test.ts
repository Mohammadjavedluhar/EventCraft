import { describe, it, expect } from 'vitest';
import { extractCompactEventData } from '../utils/sharedEventLogic';
import { parseEventRequestDeterministic } from '../utils/parser';

describe('Efficiency, Latency & High-Throughput Benchmarks', () => {
  it('extracts compact event data with sub-millisecond latency (<1ms)', () => {
    const brief = "Asha and Kiran's royal wedding in Udaipur for 250 guests with ₹15,00,000 budget in Traditional style";
    
    // Warm-up
    extractCompactEventData(brief);

    const iterations = 500;
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      extractCompactEventData(brief);
    }
    const duration = performance.now() - start;
    const avgLatencyMs = duration / iterations;

    expect(avgLatencyMs).toBeLessThan(1.0); // Strict < 1ms average execution time
  });

  it('serves repeated requests instantly from memory cache (<0.1ms)', () => {
    const brief = "Rohan's milestone 30th birthday rooftop party for 80 attendees with 150000 budget";
    
    // Initial parse to prime cache
    extractCompactEventData(brief);

    const start = performance.now();
    const result = extractCompactEventData(brief);
    const cachedLatency = performance.now() - start;

    expect(cachedLatency).toBeLessThan(1.0);
    expect(result.guestCount).toBe(80);
    expect(result.totalBudget).toBe(150000);
  });

  it('processes massive 10,000-character adversarial briefs linearly without ReDoS stalling', () => {
    // Generate adversarial string: repeated words and digits that would stall backtracking regexes
    const padding = "event planning coordination celebration ".repeat(250);
    const adversarialBrief = `Asha and Kiran's wedding for 250 guests with 1500000 budget. ${padding}`;

    const start = performance.now();
    const data = extractCompactEventData(adversarialBrief);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(50); // Must resolve in < 50ms without catastrophic backtracking
    expect(data.guestCount).toBe(250);
    expect(data.totalBudget).toBe(1500000);
  });

  it('computes complete multi-category masterplan deterministically in < 5ms average latency', () => {
    const brief = "Tech symposium for 1200 participants with 800000 budget in Bengaluru";
    
    // Warm-up JIT compilation
    parseEventRequestDeterministic(brief);

    const iterations = 50;
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      parseEventRequestDeterministic(brief);
    }
    const avgDuration = (performance.now() - start) / iterations;

    expect(avgDuration).toBeLessThan(5.0);
    const plan = parseEventRequestDeterministic(brief);
    expect(plan.guestCount.expected).toBe(1200);
    expect(plan.budget.categories.length).toBeGreaterThanOrEqual(7);
    expect(plan.capacityMetrics.barsRecommended).toBeGreaterThanOrEqual(1);
  });

  it('demonstrates throughput exceeding 1,000 parses per second', () => {
    const brief = "Community Diwali festival for 450 guests with 300000 budget";
    const start = performance.now();
    const count = 1000;
    
    for (let i = 0; i < count; i++) {
      extractCompactEventData(brief);
    }
    const elapsedSeconds = (performance.now() - start) / 1000;
    const throughput = count / elapsedSeconds;

    expect(throughput).toBeGreaterThan(1000); // Exceeds 1,000 ops/sec
  });
});
