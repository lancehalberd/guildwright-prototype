// Lists each quest's campaign tier and base power. Run: npx tsx scripts/questTiers.ts
import {questOrder, questTier, quests} from '../src/data/quests';

for (const k of questOrder) console.log(k, questTier(k), quests[k].basePower, quests[k].name, quests[k].entryFee ?? 0, quests[`${k}:endless`]?.entryFee);
