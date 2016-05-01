
/**
 * Create a new challenge in the user's datastore
 * Must have at least one question.
 * Each question must have a unique identifier, such as 'buy-cost'.
 * A challenge is just a collection of questions arranged together.
 * A challenge does not contain challenges, it effectively refers to them.
 *
 * When a user completes a challenge in entirety,
 * the completion becomes a fact.
 *
 * A fact is essentially a challenge.
 *
 * A fact is stored like a map.
 * {
 *  buyCost: 44.00,
 *  units: 2210,
 *  symbol: "APH.L",
 * }
 *
 * A fact corresponds to each challenge?
 *
 * When a fact is stored, it will be timestamped.
 *
 * A fact belongs to a challenge because a challenge is effectively the program that created the fact.
 *
 * Knowledgebases?
 *
 * Knowledgebases read in facts and calculate new facts.
 * Knowledgebases often incorporate time into their outputs, such as
 * every minute or hour.
 *
 * This leads to a stream of facts.
 *
 * This stream of facts can be mapped and reduced into
 * more interesting data.
 *
 * All my purchased stocks can be aggregated into my current position.
 *
 * User completes a stock purchase. Creates a persistent fact.
 * Code that depends on stock purchase evaluates
 * and and also emits a fact, one that is transitory.
 *
 *
 *
 *
 *
 *
 */

module.exports = {
  createFact: createFact,
  createChallenge: createChallenge
  createQuestion: createChallenge
}

