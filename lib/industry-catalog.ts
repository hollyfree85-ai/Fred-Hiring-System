export const experienceLevels = ["none", "under_1", "1_2", "3_5", "over_5"] as const;
export type ExperienceLevel = (typeof experienceLevels)[number];

export const experienceLevelLabels: Record<ExperienceLevel, string> = {
  none: "No restaurant experience",
  under_1: "Less than 1 year",
  "1_2": "1–2 years",
  "3_5": "3–5 years",
  over_5: "More than 5 years",
};

export type AssessmentProfile =
  | "host_cashier"
  | "server"
  | "bartender"
  | "busser_runner"
  | "assistant_manager"
  | "cook"
  | "sushi_cook"
  | "cook_prep"
  | "sushi_prep"
  | "sushi_chef";

export const restaurantGroups = [
  { id: "service_model", label: "Service model & price point" },
  { id: "american", label: "American restaurant concepts" },
  { id: "steak_bbq", label: "Steak, barbecue & meat" },
  { id: "seafood", label: "Seafood concepts" },
  { id: "japanese", label: "Japanese concepts" },
  { id: "chinese_taiwanese", label: "Chinese & Taiwanese concepts" },
  { id: "korean", label: "Korean concepts" },
  { id: "southeast_asian", label: "Southeast Asian concepts" },
] as const;

export type RestaurantGroupId = (typeof restaurantGroups)[number]["id"];

type RestaurantConceptSeed = {
  group: RestaurantGroupId;
  labels: readonly string[];
};

const restaurantConceptSeeds: readonly RestaurantConceptSeed[] = [
  {
    group: "service_model",
    labels: [
      "Luxury Fine Dining", "Fine Dining", "Contemporary Fine Dining", "Upscale Dining", "Upscale Casual",
      "Casual Dining", "Neighborhood Restaurant", "Family Dining", "Family-Style Restaurant", "Diner",
      "Fast Casual", "Quick Service Restaurant / QSR", "Counter Service", "Table Service Restaurant",
      "Self-Service Restaurant", "Cafeteria", "Buffet Restaurant", "All-You-Can-Eat / AYCE", "Grill Buffet",
      "Food Court Restaurant", "Food Hall Stall", "Mall Restaurant", "Kiosk Restaurant", "Drive-Thru Restaurant",
      "Drive-In Restaurant", "Takeout-Only Restaurant", "Delivery-Only Restaurant", "Ghost Kitchen",
      "Virtual Restaurant / Virtual Brand", "Cloud Kitchen", "Commissary Kitchen Concept", "Food Truck", "Food Cart",
      "Mobile Food Trailer", "Pop-Up Restaurant", "Seasonal Restaurant", "Supper Club", "Private Dining Club",
      "Members-Only Restaurant", "Chef's Table", "Tasting Menu Restaurant", "Prix-Fixe Restaurant",
      "Small Plates Restaurant", "Shared-Plates Restaurant", "Tapas-Style Restaurant", "BYOB Restaurant",
      "Farm-to-Table Restaurant", "Locavore Restaurant", "Organic Restaurant", "Chef-Driven Restaurant",
    ],
  },
  {
    group: "american",
    labels: [
      "Traditional American Restaurant", "New American Restaurant", "Contemporary American Restaurant", "American Grill",
      "Bar & Grill", "Neighborhood Grill", "Roadhouse", "American Diner", "Retro Diner", "Breakfast Restaurant",
      "Brunch Restaurant", "Pancake House", "Waffle House Concept", "Egg / Breakfast Specialty Restaurant",
      "Burger Restaurant", "Gourmet Burger Restaurant", "Smash Burger Restaurant", "Slider Restaurant",
      "Hot Dog Restaurant", "Chili Dog / Coney Restaurant", "Sandwich Shop", "Deli / Delicatessen",
      "Cheesesteak Shop", "Submarine Sandwich Shop", "Grilled Cheese Restaurant", "Chicken Sandwich Restaurant",
      "Fried Chicken Restaurant", "Chicken Tender Restaurant", "Chicken Wing Restaurant", "Rotisserie Chicken Restaurant",
      "Chicken & Waffles Restaurant", "Meat-and-Three Restaurant", "Comfort Food Restaurant", "Soul Food Restaurant",
      "Southern Restaurant", "Country Cooking Restaurant", "Lowcountry Restaurant", "Cajun Restaurant",
      "Creole Restaurant", "Louisiana Restaurant", "Tex-Mex Restaurant",
    ],
  },
  {
    group: "steak_bbq",
    labels: [
      "Traditional Steakhouse", "Prime Steakhouse", "Luxury Steakhouse", "Modern Steakhouse", "Steak & Seafood Restaurant",
      "Brazilian Steakhouse / Churrascaria", "Argentinian Steakhouse / Parrilla", "BBQ Restaurant", "Smokehouse",
      "Texas BBQ", "Central Texas BBQ", "Kansas City BBQ", "Memphis BBQ", "Carolina BBQ", "St. Louis BBQ",
      "Alabama BBQ", "Whole Hog BBQ", "BBQ Buffet", "Korean-American BBQ Fusion",
    ],
  },
  {
    group: "seafood",
    labels: [
      "General Seafood Restaurant", "Seafood Grill", "Seafood House", "Fish House", "Fish Grill", "Fish Fry Restaurant",
      "Fried Seafood Restaurant", "Seafood Buffet", "Crab House", "Crab Shack", "Lobster House", "Shrimp House",
      "Oyster Bar", "Raw Bar", "Clam Shack", "Fish & Chips Shop", "New England Seafood Restaurant",
      "Coastal Seafood Restaurant", "Gulf Coast Seafood Restaurant", "Cajun Seafood Restaurant", "Cajun Seafood Boil",
      "Louisiana Seafood Boil", "Asian-Cajun Seafood Boil", "Vietnamese-Cajun / Viet-Cajun Seafood",
      "Seafood Boil Bag Restaurant", "Seafood Boil + Bar Concept", "Seafood Market & Restaurant",
      "Catch-and-Cook Seafood Restaurant",
    ],
  },
  {
    group: "japanese",
    labels: [
      "Traditional Japanese Restaurant", "Japanese Casual Dining", "Japanese Fine Dining", "Sushi Restaurant", "Sushi Bar",
      "AYCE Sushi", "Premium Sushi", "Omakase Restaurant", "Kaiten / Conveyor-Belt Sushi", "Sushi Takeout / Express",
      "Sushi + Hibachi Restaurant", "Teppanyaki Restaurant", "Hibachi Show Restaurant", "Hibachi Steakhouse",
      "Hibachi Express", "Hibachi Fast Casual", "Japanese Steakhouse", "Ramen Restaurant", "Udon Restaurant",
      "Soba Restaurant", "Japanese Noodle House", "Izakaya", "Yakitori Restaurant", "Yakiniku / Japanese BBQ",
      "Shabu-Shabu Restaurant", "Japanese Hot Pot", "Tempura Restaurant", "Tonkatsu / Katsu Restaurant",
      "Japanese Curry Restaurant", "Donburi / Rice Bowl Restaurant", "Japanese Bakery / Café",
      "Japanese Fusion Restaurant",
    ],
  },
  {
    group: "chinese_taiwanese",
    labels: [
      "American-Chinese Restaurant", "Traditional Chinese Restaurant", "Cantonese Restaurant", "Sichuan / Szechuan Restaurant",
      "Hunan Restaurant", "Shanghainese Restaurant", "Beijing / Northern Chinese Restaurant", "Dongbei Restaurant",
      "Xi'an / Northwestern Chinese Restaurant", "Uyghur-Chinese Restaurant", "Chinese Seafood Restaurant",
      "Chinese BBQ / Roast Meat Restaurant", "Dim Sum Restaurant", "Chinese Hot Pot", "Malatang Restaurant",
      "Mala Dry Pot Restaurant", "Chinese Noodle House", "Hand-Pulled Noodle Restaurant", "Dumpling House",
      "Soup Dumpling / Xiaolongbao Restaurant", "Chinese Buffet", "Chinese Takeout", "Chinese Fast Food",
      "Chinese Bakery Café", "Taiwanese Restaurant", "Taiwanese Beef Noodle Restaurant", "Taiwanese Café",
      "Hong Kong Café / Cha Chaan Teng",
    ],
  },
  {
    group: "korean",
    labels: [
      "Traditional Korean Restaurant", "Korean BBQ", "AYCE Korean BBQ", "Premium Korean BBQ", "Korean Fried Chicken",
      "Korean Hot Pot", "Korean Tofu House / Soon Tofu", "Korean Soup Restaurant", "Bibimbap Restaurant",
      "Korean Street Food Restaurant", "Korean Café", "Korean-Japanese Fusion",
    ],
  },
  {
    group: "southeast_asian",
    labels: [
      "Thai Restaurant", "Thai Street Food Restaurant", "Thai Noodle Restaurant", "Vietnamese Restaurant", "Pho Restaurant",
      "Banh Mi Shop", "Vietnamese Seafood Restaurant", "Viet-Cajun Restaurant", "Indonesian Restaurant",
      "Malaysian Restaurant",
    ],
  },
] as const;

function inferRestaurantTags(label: string, group: RestaurantGroupId) {
  const value = label.toLowerCase();
  const tags = new Set<string>([group]);
  const addWhen = (pattern: RegExp, ...values: string[]) => {
    if (pattern.test(value)) values.forEach((item) => tags.add(item));
  };
  addWhen(/fine dining|luxury|upscale|chef's table|tasting|prix-fixe|omakase|premium/, "upscale", "full_service");
  addWhen(/casual|family|neighborhood|diner|roadhouse|grill|table service/, "casual", "full_service");
  addWhen(/quick service|qsr|fast casual|counter|kiosk|drive-|food court|stall|express|fast food/, "counter_service", "high_volume");
  addWhen(/takeout|delivery|ghost|virtual|cloud|commissary|mobile|food truck|food cart|trailer|curbside/, "off_premise");
  addWhen(/buffet|all-you-can-eat|ayce|cafeteria|self-service/, "buffet", "high_volume");
  addWhen(/bar|izakaya|pub|tavern|cocktail|wine/, "bar");
  addWhen(/seafood|fish|crab|lobster|shrimp|oyster|clam|cajun|creole|lowcountry/, "seafood");
  addWhen(/boil/, "seafood_boil");
  addWhen(/steak|churrascaria|parrilla|broiler/, "steakhouse");
  addWhen(/bbq|barbecue|smokehouse|whole hog|pit/, "barbecue");
  addWhen(/japanese|sushi|omakase|kaiten|ramen|udon|soba|izakaya|yakitori|yakiniku|shabu|tempura|tonkatsu|donburi|hibachi|teppanyaki/, "japanese");
  addWhen(/sushi|omakase|kaiten|sashimi/, "sushi");
  addWhen(/hibachi show|teppanyaki|hibachi steakhouse/, "hibachi_show");
  addWhen(/hibachi express|hibachi fast casual/, "hibachi_express", "counter_service");
  addWhen(/chinese|cantonese|sichuan|szechuan|hunan|shanghai|beijing|dongbei|xi'an|uyghur|dim sum|malatang|mala|dumpling|xiaolongbao|taiwan|hong kong/, "chinese");
  addWhen(/korean|bibimbap|soon tofu/, "korean");
  addWhen(/thai|vietnam|pho|banh mi|indonesian|malaysian|viet-cajun/, "southeast_asian");
  addWhen(/breakfast|brunch|pancake|waffle|egg/, "breakfast");
  addWhen(/bakery|baker|pastry|café|cafe|coffee|snack/, "bakery_cafe");
  addWhen(/catering|banquet|event|private dining|club/, "events");
  return [...tags];
}

export const restaurantConcepts = restaurantConceptSeeds.flatMap((seed, seedIndex) => {
  const offset = restaurantConceptSeeds.slice(0, seedIndex).reduce((sum, item) => sum + item.labels.length, 0);
  return seed.labels.map((label, labelIndex) => ({
    id: `concept_${String(offset + labelIndex + 1).padStart(3, "0")}`,
    label,
    group: seed.group,
    tags: inferRestaurantTags(label, seed.group),
  }));
});

export type RestaurantConceptId = (typeof restaurantConcepts)[number]["id"];

type PositionDefinition = {
  id: string;
  label: string;
  profile: AssessmentProfile;
  relatedProfiles?: readonly AssessmentProfile[];
  alcoholService?: boolean;
};

type JobFamilyDefinition = {
  id: string;
  label: string;
  positions: readonly PositionDefinition[];
};

export const jobFamilies = [
  {
    id: "management", label: "Management", positions: [
      { id: "general_manager", label: "General Manager", profile: "assistant_manager", relatedProfiles: ["host_cashier", "server", "bartender", "cook"], alcoholService: true },
      { id: "assistant_general_manager", label: "Assistant General Manager", profile: "assistant_manager", relatedProfiles: ["host_cashier", "server", "cook"], alcoholService: true },
      { id: "restaurant_manager", label: "Restaurant Manager", profile: "assistant_manager", relatedProfiles: ["host_cashier", "server", "cook"], alcoholService: true },
      { id: "assistant_manager", label: "Assistant Manager", profile: "assistant_manager", relatedProfiles: ["host_cashier", "server", "cook"], alcoholService: true },
      { id: "floor_manager", label: "Floor Manager", profile: "assistant_manager", relatedProfiles: ["host_cashier", "server", "busser_runner"], alcoholService: true },
      { id: "foh_manager", label: "FOH Manager", profile: "assistant_manager", relatedProfiles: ["host_cashier", "server", "bartender"], alcoholService: true },
      { id: "shift_manager", label: "Shift Manager", profile: "assistant_manager", relatedProfiles: ["host_cashier", "server", "cook"], alcoholService: true },
      { id: "shift_leader", label: "Shift Leader", profile: "assistant_manager", relatedProfiles: ["host_cashier", "server", "cook"] },
      { id: "supervisor", label: "Supervisor", profile: "assistant_manager", relatedProfiles: ["host_cashier", "server", "cook"] },
      { id: "training_manager", label: "Training Manager", profile: "assistant_manager", relatedProfiles: ["host_cashier", "server", "cook"] },
    ],
  },
  {
    id: "kitchen_management", label: "Kitchen Management", positions: [
      { id: "executive_chef", label: "Executive Chef", profile: "cook", relatedProfiles: ["assistant_manager", "cook_prep", "sushi_chef"] },
      { id: "head_chef", label: "Head Chef", profile: "cook", relatedProfiles: ["assistant_manager", "cook_prep", "sushi_chef"] },
      { id: "chef_de_cuisine", label: "Chef de Cuisine", profile: "cook", relatedProfiles: ["assistant_manager", "cook_prep"] },
      { id: "sous_chef", label: "Sous Chef", profile: "cook", relatedProfiles: ["assistant_manager", "cook_prep"] },
      { id: "kitchen_manager", label: "Kitchen Manager", profile: "cook", relatedProfiles: ["assistant_manager", "cook_prep"] },
      { id: "assistant_kitchen_manager", label: "Assistant Kitchen Manager", profile: "cook", relatedProfiles: ["assistant_manager", "cook_prep"] },
      { id: "lead_cook", label: "Lead Cook", profile: "cook", relatedProfiles: ["cook_prep", "assistant_manager"] },
    ],
  },
  {
    id: "server_guest_service", label: "Server & Guest Service", positions: [
      { id: "server", label: "Server", profile: "server", relatedProfiles: ["host_cashier", "busser_runner"], alcoholService: true },
      { id: "lead_server", label: "Lead Server", profile: "server", relatedProfiles: ["assistant_manager", "host_cashier", "busser_runner"], alcoholService: true },
      { id: "server_trainer", label: "Server Trainer", profile: "server", relatedProfiles: ["assistant_manager", "host_cashier"], alcoholService: true },
      { id: "fine_dining_server", label: "Fine Dining Server", profile: "server", relatedProfiles: ["bartender", "host_cashier"], alcoholService: true },
      { id: "cocktail_server", label: "Cocktail Server", profile: "server", relatedProfiles: ["bartender", "host_cashier"], alcoholService: true },
      { id: "hibachi_server", label: "Hibachi Server", profile: "server", relatedProfiles: ["host_cashier", "busser_runner"], alcoholService: true },
      { id: "sushi_server", label: "Sushi Server", profile: "server", relatedProfiles: ["host_cashier", "sushi_cook"], alcoholService: true },
      { id: "banquet_server", label: "Banquet Server", profile: "server", relatedProfiles: ["busser_runner", "host_cashier"], alcoholService: true },
      { id: "server_assistant_service", label: "Server Assistant", profile: "busser_runner", relatedProfiles: ["server", "host_cashier"] },
    ],
  },
  {
    id: "host_cashier_front_desk", label: "Host, Cashier & Front Desk", positions: [
      { id: "host_hostess", label: "Host / Hostess", profile: "host_cashier", relatedProfiles: ["server", "busser_runner"] },
      { id: "lead_host", label: "Lead Host", profile: "host_cashier", relatedProfiles: ["assistant_manager", "server"] },
      { id: "host_cashier", label: "Host / Cashier", profile: "host_cashier", relatedProfiles: ["server", "busser_runner"] },
      { id: "cashier", label: "Cashier", profile: "host_cashier", relatedProfiles: ["server", "assistant_manager"] },
      { id: "greeter", label: "Greeter", profile: "host_cashier", relatedProfiles: ["server", "busser_runner"] },
      { id: "reservationist", label: "Reservationist", profile: "host_cashier", relatedProfiles: ["server", "assistant_manager"] },
      { id: "seating_coordinator", label: "Seating Coordinator", profile: "host_cashier", relatedProfiles: ["server", "assistant_manager"] },
      { id: "waitlist_coordinator", label: "Waitlist Coordinator", profile: "host_cashier", relatedProfiles: ["server", "assistant_manager"] },
    ],
  },
  {
    id: "bar_beverage", label: "Bar & Beverage", positions: [
      { id: "bartender", label: "Bartender", profile: "bartender", relatedProfiles: ["server", "host_cashier"], alcoholService: true },
      { id: "lead_bartender", label: "Lead Bartender", profile: "bartender", relatedProfiles: ["assistant_manager", "server"], alcoholService: true },
      { id: "head_bartender", label: "Head Bartender", profile: "bartender", relatedProfiles: ["assistant_manager", "server"], alcoholService: true },
      { id: "barback", label: "Barback", profile: "busser_runner", relatedProfiles: ["bartender", "cook_prep"], alcoholService: true },
      { id: "service_bartender", label: "Service Bartender", profile: "bartender", relatedProfiles: ["server", "host_cashier"], alcoholService: true },
      { id: "cocktail_bartender", label: "Cocktail Bartender", profile: "bartender", relatedProfiles: ["server", "assistant_manager"], alcoholService: true },
      { id: "mixologist", label: "Mixologist", profile: "bartender", relatedProfiles: ["server", "assistant_manager"], alcoholService: true },
      { id: "sommelier", label: "Sommelier", profile: "bartender", relatedProfiles: ["server", "assistant_manager"], alcoholService: true },
      { id: "wine_server", label: "Wine Server", profile: "server", relatedProfiles: ["bartender", "host_cashier"], alcoholService: true },
    ],
  },
  {
    id: "runner_busser_expo", label: "Food Runner, Busser & Expo", positions: [
      { id: "food_runner", label: "Food Runner", profile: "busser_runner", relatedProfiles: ["server", "cook_prep"] },
      { id: "lead_food_runner", label: "Lead Food Runner", profile: "busser_runner", relatedProfiles: ["server", "assistant_manager"] },
      { id: "busser_runner", label: "Busser", profile: "busser_runner", relatedProfiles: ["server", "cook_prep"] },
      { id: "server_assistant", label: "Server Assistant", profile: "busser_runner", relatedProfiles: ["server", "host_cashier"] },
      { id: "expo", label: "Expo", profile: "busser_runner", relatedProfiles: ["server", "cook"] },
      { id: "expediter", label: "Expediter", profile: "busser_runner", relatedProfiles: ["server", "cook"] },
      { id: "dining_room_attendant", label: "Dining Room Attendant", profile: "busser_runner", relatedProfiles: ["server", "host_cashier"] },
    ],
  },
  {
    id: "general_kitchen", label: "General Kitchen / Cook", positions: [
      { id: "cook", label: "Line Cook", profile: "cook", relatedProfiles: ["cook_prep", "assistant_manager"] },
      { id: "cook_prep", label: "Prep Cook", profile: "cook_prep", relatedProfiles: ["cook", "sushi_prep"] },
      { id: "grill_cook", label: "Grill Cook", profile: "cook", relatedProfiles: ["cook_prep", "assistant_manager"] },
      { id: "fry_cook", label: "Fry Cook", profile: "cook", relatedProfiles: ["cook_prep", "assistant_manager"] },
      { id: "saute_cook", label: "Sauté Cook", profile: "cook", relatedProfiles: ["cook_prep", "assistant_manager"] },
      { id: "broiler_cook", label: "Broiler Cook", profile: "cook", relatedProfiles: ["cook_prep", "assistant_manager"] },
      { id: "oven_cook", label: "Oven Cook", profile: "cook", relatedProfiles: ["cook_prep", "assistant_manager"] },
      { id: "breakfast_cook", label: "Breakfast Cook", profile: "cook", relatedProfiles: ["cook_prep", "assistant_manager"] },
      { id: "pantry_cook", label: "Pantry Cook", profile: "cook_prep", relatedProfiles: ["cook", "sushi_prep"] },
      { id: "production_cook", label: "Production Cook", profile: "cook_prep", relatedProfiles: ["cook", "assistant_manager"] },
      { id: "kitchen_helper", label: "Kitchen Helper", profile: "cook_prep", relatedProfiles: ["cook", "busser_runner"] },
    ],
  },
  {
    id: "japanese_sushi", label: "Japanese & Sushi", positions: [
      { id: "sushi_chef", label: "Sushi Chef", profile: "sushi_chef", relatedProfiles: ["sushi_cook", "sushi_prep"] },
      { id: "head_sushi_chef", label: "Head Sushi Chef", profile: "sushi_chef", relatedProfiles: ["assistant_manager", "sushi_cook", "sushi_prep"] },
      { id: "sushi_prep", label: "Sushi Prep Chef", profile: "sushi_prep", relatedProfiles: ["sushi_cook", "cook_prep"] },
      { id: "sushi_helper", label: "Sushi Helper / Apprentice", profile: "sushi_prep", relatedProfiles: ["sushi_cook", "cook_prep"] },
      { id: "omakase_chef", label: "Omakase Chef", profile: "sushi_chef", relatedProfiles: ["sushi_cook", "assistant_manager"] },
      { id: "sashimi_chef", label: "Sashimi Chef", profile: "sushi_chef", relatedProfiles: ["sushi_cook", "sushi_prep"] },
      { id: "ramen_chef", label: "Ramen Chef", profile: "cook", relatedProfiles: ["cook_prep", "sushi_cook"] },
      { id: "tempura_cook", label: "Tempura Cook", profile: "cook", relatedProfiles: ["sushi_cook", "cook_prep"] },
      { id: "yakitori_chef", label: "Yakitori Chef", profile: "cook", relatedProfiles: ["sushi_cook", "cook_prep"] },
      { id: "robata_chef", label: "Robata Chef", profile: "cook", relatedProfiles: ["sushi_cook", "cook_prep"] },
    ],
  },
  {
    id: "hibachi_teppanyaki", label: "Hibachi / Teppanyaki", positions: [
      { id: "hibachi_chef", label: "Hibachi Chef", profile: "cook", relatedProfiles: ["server", "assistant_manager"] },
      { id: "head_hibachi_chef", label: "Head Hibachi Chef", profile: "cook", relatedProfiles: ["assistant_manager", "server"] },
      { id: "hibachi_show_chef", label: "Hibachi Show Chef", profile: "cook", relatedProfiles: ["server", "assistant_manager"] },
      { id: "teppanyaki_chef", label: "Teppanyaki Chef", profile: "cook", relatedProfiles: ["server", "assistant_manager"] },
      { id: "hibachi_grill_cook", label: "Hibachi Grill Cook", profile: "cook", relatedProfiles: ["cook_prep", "server"] },
      { id: "hibachi_express_cook", label: "Hibachi Express Cook", profile: "cook", relatedProfiles: ["cook_prep", "host_cashier"] },
    ],
  },
  {
    id: "specialty_kitchen", label: "Specialty Kitchen", positions: [
      { id: "seafood_boil_cook", label: "Seafood Boil Cook", profile: "cook", relatedProfiles: ["cook_prep", "assistant_manager"] },
      { id: "seafood_prep", label: "Seafood Prep", profile: "cook_prep", relatedProfiles: ["cook", "sushi_prep"] },
      { id: "oyster_shucker", label: "Oyster Shucker", profile: "sushi_prep", relatedProfiles: ["cook_prep", "sushi_chef"] },
      { id: "raw_bar_chef", label: "Raw Bar Chef", profile: "sushi_chef", relatedProfiles: ["sushi_prep", "cook_prep"] },
      { id: "fish_cutter", label: "Fish Cutter", profile: "sushi_prep", relatedProfiles: ["sushi_chef", "cook_prep"] },
      { id: "wok_chef", label: "Wok Chef", profile: "cook", relatedProfiles: ["cook_prep", "assistant_manager"] },
      { id: "dim_sum_chef", label: "Dim Sum Chef", profile: "cook", relatedProfiles: ["cook_prep", "assistant_manager"] },
      { id: "dumpling_chef", label: "Dumpling Chef", profile: "cook_prep", relatedProfiles: ["cook", "assistant_manager"] },
      { id: "noodle_chef", label: "Noodle Chef", profile: "cook", relatedProfiles: ["cook_prep", "assistant_manager"] },
      { id: "korean_bbq_cook", label: "Korean BBQ Cook", profile: "cook", relatedProfiles: ["cook_prep", "assistant_manager"] },
      { id: "pitmaster", label: "Pitmaster", profile: "cook", relatedProfiles: ["cook_prep", "assistant_manager"] },
      { id: "bbq_cook", label: "BBQ Cook", profile: "cook", relatedProfiles: ["cook_prep", "assistant_manager"] },
      { id: "steak_broiler_chef", label: "Steak / Broiler Chef", profile: "cook", relatedProfiles: ["cook_prep", "assistant_manager"] },
      { id: "pizza_chef", label: "Pizza Chef", profile: "cook", relatedProfiles: ["cook_prep", "assistant_manager"] },
      { id: "baker", label: "Baker", profile: "cook_prep", relatedProfiles: ["cook", "assistant_manager"] },
      { id: "pastry_chef", label: "Pastry Chef", profile: "cook_prep", relatedProfiles: ["cook", "assistant_manager"] },
    ],
  },
  {
    id: "takeout_delivery_catering", label: "Takeout, Delivery & Catering", positions: [
      { id: "to_go_specialist", label: "To-Go Specialist", profile: "host_cashier", relatedProfiles: ["server", "busser_runner"] },
      { id: "takeout_cashier", label: "Takeout Cashier", profile: "host_cashier", relatedProfiles: ["server", "assistant_manager"] },
      { id: "curbside_attendant", label: "Curbside Attendant", profile: "host_cashier", relatedProfiles: ["server", "busser_runner"] },
      { id: "online_order_specialist", label: "Online Order Specialist", profile: "host_cashier", relatedProfiles: ["server", "assistant_manager"] },
      { id: "delivery_coordinator", label: "Delivery Coordinator", profile: "host_cashier", relatedProfiles: ["assistant_manager", "server"] },
      { id: "delivery_driver", label: "Delivery Driver", profile: "host_cashier", relatedProfiles: ["server", "busser_runner"] },
      { id: "catering_staff", label: "Catering Staff", profile: "server", relatedProfiles: ["busser_runner", "host_cashier"] },
      { id: "catering_coordinator", label: "Catering Coordinator", profile: "assistant_manager", relatedProfiles: ["host_cashier", "server"] },
      { id: "banquet_staff", label: "Banquet Staff", profile: "server", relatedProfiles: ["busser_runner", "host_cashier"] },
      { id: "event_server", label: "Event Server", profile: "server", relatedProfiles: ["busser_runner", "host_cashier"], alcoholService: true },
    ],
  },
  {
    id: "utility_cleaning_support", label: "Utility, Cleaning & Support", positions: [
      { id: "dishwasher", label: "Dishwasher", profile: "cook_prep", relatedProfiles: ["busser_runner", "cook"] },
      { id: "lead_dishwasher", label: "Lead Dishwasher", profile: "cook_prep", relatedProfiles: ["busser_runner", "assistant_manager"] },
      { id: "kitchen_porter", label: "Kitchen Porter", profile: "cook_prep", relatedProfiles: ["busser_runner", "cook"] },
      { id: "utility_worker", label: "Utility Worker", profile: "busser_runner", relatedProfiles: ["cook_prep", "host_cashier"] },
      { id: "cleaner", label: "Cleaner", profile: "busser_runner", relatedProfiles: ["cook_prep", "host_cashier"] },
      { id: "janitor", label: "Janitor", profile: "busser_runner", relatedProfiles: ["cook_prep", "host_cashier"] },
      { id: "stocker", label: "Stocker", profile: "cook_prep", relatedProfiles: ["busser_runner", "assistant_manager"] },
      { id: "receiver", label: "Receiver", profile: "cook_prep", relatedProfiles: ["assistant_manager", "cook"] },
      { id: "inventory_clerk", label: "Inventory Clerk", profile: "cook_prep", relatedProfiles: ["assistant_manager", "host_cashier"] },
      { id: "maintenance_worker", label: "Maintenance Worker", profile: "busser_runner", relatedProfiles: ["cook_prep", "assistant_manager"] },
    ],
  },
] as const satisfies readonly JobFamilyDefinition[];

export type JobFamilyId = (typeof jobFamilies)[number]["id"];
type SelectableCandidateRole = (typeof jobFamilies)[number]["positions"][number]["id"];
export type CandidateRole = SelectableCandidateRole | "sushi_cook";

export const selectablePositions = jobFamilies.flatMap((family) =>
  family.positions.map((position) => ({ ...position, familyId: family.id as JobFamilyId })),
);

// Kept outside the applicant selector so historical submissions made before
// the September 2026 catalog update can still be opened and rescored.
const archivedPositions = [{
  id: "sushi_cook",
  label: "Sushi Cook",
  profile: "sushi_cook",
  relatedProfiles: ["sushi_prep", "sushi_chef"],
  familyId: "japanese_sushi",
}] as const satisfies readonly (PositionDefinition & { familyId: JobFamilyId })[];

export const positions = [...selectablePositions, ...archivedPositions];
export const candidateRoles = selectablePositions.map((position) => position.id) as CandidateRole[];
export const roleLabels = Object.fromEntries(positions.map((position) => [position.id, position.label])) as Record<CandidateRole, string>;
export const jobFamilyLabels = Object.fromEntries(jobFamilies.map((family) => [family.id, family.label])) as Record<JobFamilyId, string>;

export function isCandidateRole(value: unknown): value is CandidateRole {
  return typeof value === "string" && positions.some((position) => position.id === value);
}

export function isJobFamily(value: unknown): value is JobFamilyId {
  return typeof value === "string" && jobFamilies.some((family) => family.id === value);
}

export function isRestaurantConcept(value: unknown): value is RestaurantConceptId {
  return typeof value === "string" && restaurantConcepts.some((concept) => concept.id === value);
}

export function isExperienceLevel(value: unknown): value is ExperienceLevel {
  return typeof value === "string" && experienceLevels.includes(value as ExperienceLevel);
}

export function positionForRole(role: CandidateRole) {
  return positions.find((position) => position.id === role)!;
}

export function familyForRole(role: CandidateRole) {
  const familyId = positionForRole(role).familyId;
  return jobFamilies.find((family) => family.id === familyId)!;
}

export function restaurantConceptById(id: RestaurantConceptId) {
  return restaurantConcepts.find((concept) => concept.id === id)!;
}

export function positionRequiresAlcoholTraining(role: CandidateRole) {
  const position = positionForRole(role);
  return "alcoholService" in position && Boolean(position.alcoholService);
}
