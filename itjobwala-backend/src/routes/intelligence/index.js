import { getMarketIntelligenceHandler }   from '../../controllers/intelligence/getMarketIntelligence.js';
import { getLearningIntelligenceHandler } from '../../controllers/intelligence/getLearningIntelligence.js';
import { getBenchmarkingHandler }         from '../../controllers/intelligence/getBenchmarking.js';
import { getWeightEngineHandler }         from '../../controllers/intelligence/getWeightEngine.js';

export default async function intelligenceRoutes(fastify) {
  const candidateOnly = { preValidation: [fastify.requireCandidate] };

  // Phase 2: Market Intelligence Engine
  fastify.get('/intelligence/market',        candidateOnly, getMarketIntelligenceHandler);

  // Phase 3: Learning Resource Intelligence
  fastify.get('/intelligence/learning',      candidateOnly, getLearningIntelligenceHandler);

  // Phase 6: Candidate Benchmarking System
  fastify.get('/intelligence/benchmarking',  candidateOnly, getBenchmarkingHandler);

  // Phase 7: Dynamic ATS Weight Engine
  fastify.get('/intelligence/weights',       candidateOnly, getWeightEngineHandler);
}
