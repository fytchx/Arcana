/* ArcanaWiki V1 approved page tree. Do not create placeholder articles.
 * Existing IDs and published links remain stable across category reorganization. */
export const WIKI_TAXONOMY_VERSION=1;
export const WIKI_CATEGORIES=Object.freeze([
  {
    "id": "getting-started",
    "title": "Getting Started",
    "icon": "book",
    "description": "The essentials for your first season.",
    "articles": [
      {
        "id": "season-2",
        "title": "Season 2 Essentials",
        "existing": true
      }
    ]
  },
  {
    "id": "classes",
    "title": "Classes",
    "icon": "shield",
    "description": "Understand each playable class.",
    "articles": [
      {
        "id": "warrior",
        "title": "Warrior",
        "existing": false
      },
      {
        "id": "mage",
        "title": "Mage",
        "existing": false
      },
      {
        "id": "rogue",
        "title": "Rogue",
        "existing": false
      },
      {
        "id": "archer",
        "title": "Archer",
        "existing": false
      },
      {
        "id": "druid",
        "title": "Druid",
        "existing": false
      }
    ]
  },
  {
    "id": "progression",
    "title": "Progression & Farming",
    "icon": "layers",
    "description": "Levels, rewards and efficient progression.",
    "articles": [
      {
        "id": "character-level",
        "title": "Character Level & Monster Level",
        "existing": false
      },
      {
        "id": "monster-level",
        "title": "Monster Level Farming",
        "existing": true
      },
      {
        "id": "drop-bonus",
        "title": "Drop Bonus",
        "existing": false
      },
      {
        "id": "dungeons",
        "title": "Dungeons & Rewards",
        "existing": false
      }
    ]
  },
  {
    "id": "equipment",
    "title": "Equipment",
    "icon": "shield",
    "description": "Gear, upgrades, reforging and gems.",
    "articles": [
      {
        "id": "equipment-basics",
        "title": "Equipment & Slots",
        "existing": false
      },
      {
        "id": "drop-rarities",
        "title": "Equipment Rarity & Drop Progression",
        "existing": true
      },
      {
        "id": "reforging",
        "title": "Reforging",
        "existing": false
      },
      {
        "id": "forge",
        "title": "The Forge & Gear Slot Progression",
        "existing": true
      },
      {
        "id": "awakening",
        "title": "Awakening",
        "existing": false
      },
      {
        "id": "gems",
        "title": "Sockets, Gems & Equipment Slots",
        "existing": true
      },
      {
        "id": "talismans",
        "title": "Talismans",
        "existing": false
      }
    ]
  },
  {
    "id": "combat",
    "title": "Combat & Stats",
    "icon": "sword",
    "description": "Damage, defense and combat mechanics.",
    "articles": [
      {
        "id": "attack-damage",
        "title": "Attack Damage",
        "existing": false
      },
      {
        "id": "critical-hits",
        "title": "Critical Hits",
        "existing": false
      },
      {
        "id": "retaliation",
        "title": "Retaliation",
        "existing": false
      },
      {
        "id": "defense-blocking",
        "title": "Defense & Blocking",
        "existing": false
      },
      {
        "id": "extra-kill",
        "title": "Extra Kill",
        "existing": false
      }
    ]
  },
  {
    "id": "runes-skills",
    "title": "Runes & Skill Trees",
    "icon": "gem",
    "description": "Rune grids, runewords and skill planning.",
    "articles": [
      {
        "id": "rune-grid",
        "title": "Rune Grid Growth",
        "existing": true
      },
      {
        "id": "runes",
        "title": "Runes & Runewords",
        "existing": false
      },
      {
        "id": "passive-tree",
        "title": "Passive Skill Tree",
        "existing": false
      }
    ]
  },
  {
    "id": "pets",
    "title": "Pets",
    "icon": "paw",
    "description": "Pet bonuses, Compound and affixes.",
    "articles": [
      {
        "id": "pet-compound",
        "title": "Pet Compound & Equalisation",
        "existing": true
      },
      {
        "id": "pet-affix-costs",
        "title": "Pet Affix Upgrades & Shards",
        "existing": true
      }
    ]
  },
  {
    "id": "guilds-raids",
    "title": "Guilds & Raids",
    "icon": "users",
    "description": "Guild progression and group challenges.",
    "articles": [
      {
        "id": "guild-planning",
        "title": "Guild Skill Tree Planning",
        "existing": true
      },
      {
        "id": "guild-boss",
        "title": "Guild Boss",
        "existing": false
      },
      {
        "id": "rift-raids",
        "title": "Rift Raid Basics",
        "existing": true
      }
    ]
  }
]);
const byCategory=new Map(WIKI_CATEGORIES.map(c=>[c.id,c]));
const primaryArticleParent=new Map(WIKI_CATEGORIES.flatMap(c=>c.articles.map(a=>[a.id,c.id])));
const categoryByName=new Map(WIKI_CATEGORIES.map(c=>[c.title.toLowerCase(),c.id]));
export const wikiCategory=id=>byCategory.get(String(id||''))||null;
export const wikiParentCategory=id=>wikiCategory(primaryArticleParent.get(String(id||'')));
export const wikiCategoryForArticle=article=>{
 if(!article)return null;
 return wikiParentCategory(article.id)||wikiCategory(categoryByName.get(String(article.category||'').toLowerCase()))||null;
};
export const wikiPlannedArticles=()=>WIKI_CATEGORIES.flatMap(c=>c.articles.map(a=>({...a,parent:c.id})));
export const wikiCategoriesWithContent=(articles)=>WIKI_CATEGORIES.filter(c=>articles.some(a=>wikiCategoryForArticle(a)?.id===c.id));
export const wikiCategoryArticles=(id,articles)=>articles.filter(a=>wikiCategoryForArticle(a)?.id===id);
export const LEGACY_WIKI_TOPIC_REDIRECTS=Object.freeze({
 'gear-awakening':'equipment','pets-runes-talismans':'pets',
 'combat-monsters-biomes':'combat','progression':'progression','guilds-raids':'guilds-raids'
});
