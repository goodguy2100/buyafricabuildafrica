/**
 * All 54 African countries with major cities.
 * Neighbourhood / estate / suburb is captured as free text.
 */
export interface CountryData {
  code: string;
  name: string;
  cities: string[];
}

export const AFRICA_COUNTRIES: CountryData[] = [
  { code: "DZ", name: "Algeria", cities: ["Algiers", "Oran", "Constantine", "Annaba", "Blida", "Batna", "Setif"] },
  { code: "AO", name: "Angola", cities: ["Luanda", "Huambo", "Lobito", "Benguela", "Kuito", "Lubango"] },
  { code: "BJ", name: "Benin", cities: ["Cotonou", "Porto-Novo", "Parakou", "Djougou", "Abomey"] },
  { code: "BW", name: "Botswana", cities: ["Gaborone", "Francistown", "Molepolole", "Maun", "Serowe", "Kanye"] },
  { code: "BF", name: "Burkina Faso", cities: ["Ouagadougou", "Bobo-Dioulasso", "Koudougou", "Banfora", "Ouahigouya"] },
  { code: "BI", name: "Burundi", cities: ["Bujumbura", "Gitega", "Muyinga", "Ngozi", "Ruyigi"] },
  { code: "CV", name: "Cabo Verde", cities: ["Praia", "Mindelo", "Santa Maria", "Assomada"] },
  { code: "CM", name: "Cameroon", cities: ["Douala", "Yaoundé", "Bamenda", "Bafoussam", "Garoua", "Maroua", "Kribi"] },
  { code: "CF", name: "Central African Republic", cities: ["Bangui", "Bimbo", "Berberati", "Carnot", "Bambari"] },
  { code: "TD", name: "Chad", cities: ["N'Djamena", "Moundou", "Sarh", "Abéché", "Kelo"] },
  { code: "KM", name: "Comoros", cities: ["Moroni", "Mutsamudu", "Fomboni", "Domoni"] },
  { code: "CG", name: "Congo (Republic)", cities: ["Brazzaville", "Pointe-Noire", "Dolisie", "Nkayi", "Ouésso"] },
  { code: "CD", name: "Congo (DRC)", cities: ["Kinshasa", "Lubumbashi", "Mbuji-Mayi", "Kananga", "Kisangani", "Goma", "Bukavu"] },
  { code: "CI", name: "Côte d'Ivoire", cities: ["Abidjan", "Yamoussoukro", "Bouaké", "Daloa", "San-Pédro", "Korhogo"] },
  { code: "DJ", name: "Djibouti", cities: ["Djibouti", "Ali Sabieh", "Tadjoura", "Obock", "Dikhil"] },
  { code: "EG", name: "Egypt", cities: ["Cairo", "Alexandria", "Giza", "Shubra El Kheima", "Port Said", "Suez", "Luxor", "Aswan", "Mansoura"] },
  { code: "GQ", name: "Equatorial Guinea", cities: ["Malabo", "Bata", "Ebebiyín", "Aconibe"] },
  { code: "ER", name: "Eritrea", cities: ["Asmara", "Keren", "Massawa", "Assab", "Mendefera"] },
  { code: "SZ", name: "Eswatini", cities: ["Mbabane", "Manzini", "Big Bend", "Nhlangano", "Siteki"] },
  { code: "ET", name: "Ethiopia", cities: ["Addis Ababa", "Dire Dawa", "Mekelle", "Adama", "Gondar", "Hawassa", "Bahir Dar", "Jimma"] },
  { code: "GA", name: "Gabon", cities: ["Libreville", "Port-Gentil", "Franceville", "Oyem", "Moanda"] },
  { code: "GM", name: "Gambia", cities: ["Banjul", "Serekunda", "Brikama", "Bakau", "Farafenni"] },
  { code: "GH", name: "Ghana", cities: ["Accra", "Kumasi", "Tamale", "Sekondi-Takoradi", "Cape Coast", "Tema", "Sunyani", "Koforidua"] },
  { code: "GN", name: "Guinea", cities: ["Conakry", "Nzérékoré", "Kindia", "Kankan", "Labé"] },
  { code: "GW", name: "Guinea-Bissau", cities: ["Bissau", "Bafatá", "Gabú", "Bissorã", "Bolama"] },
  { code: "KE", name: "Kenya", cities: ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika", "Malindi", "Kitale", "Machakos", "Nyeri", "Meru", "Kakamega"] },
  { code: "LS", name: "Lesotho", cities: ["Maseru", "Teyateyaneng", "Mafeteng", "Hlotse", "Mohale's Hoek"] },
  { code: "LR", name: "Liberia", cities: ["Monrovia", "Gbarnga", "Buchanan", "Ganta", "Kakata"] },
  { code: "LY", name: "Libya", cities: ["Tripoli", "Benghazi", "Misrata", "Bayda", "Zawiya", "Sabha"] },
  { code: "MG", name: "Madagascar", cities: ["Antananarivo", "Toamasina", "Antsirabe", "Mahajanga", "Fianarantsoa", "Toliara"] },
  { code: "MW", name: "Malawi", cities: ["Lilongwe", "Blantyre", "Mzuzu", "Zomba", "Kasungu", "Mangochi"] },
  { code: "ML", name: "Mali", cities: ["Bamako", "Sikasso", "Mopti", "Koutiala", "Ségou", "Kayes", "Gao", "Timbuktu"] },
  { code: "MR", name: "Mauritania", cities: ["Nouakchott", "Nouadhibou", "Rosso", "Adrar", "Kaédi"] },
  { code: "MU", name: "Mauritius", cities: ["Port Louis", "Beau Bassin-Rose Hill", "Vacoas-Phoenix", "Curepipe", "Quatre Bornes"] },
  { code: "MA", name: "Morocco", cities: ["Casablanca", "Rabat", "Fez", "Marrakesh", "Agadir", "Tangier", "Meknes", "Oujda", "Kenitra"] },
  { code: "MZ", name: "Mozambique", cities: ["Maputo", "Matola", "Beira", "Nampula", "Chimoio", "Nacala", "Quelimane"] },
  { code: "NA", name: "Namibia", cities: ["Windhoek", "Walvis Bay", "Swakopmund", "Oshakati", "Rundu", "Katima Mulilo"] },
  { code: "NE", name: "Niger", cities: ["Niamey", "Zinder", "Maradi", "Agadez", "Tahoua"] },
  { code: "NG", name: "Nigeria", cities: ["Lagos", "Abuja", "Kano", "Ibadan", "Port Harcourt", "Benin City", "Kaduna", "Enugu", "Onitsha", "Warri", "Aba", "Jos", "Ilorin", "Uyo", "Calabar"] },
  { code: "RW", name: "Rwanda", cities: ["Kigali", "Butare", "Gitarama", "Ruhengeri", "Gisenyi", "Musanze"] },
  { code: "ST", name: "São Tomé and Príncipe", cities: ["São Tomé", "Santo Amaro", "Neves", "Santana"] },
  { code: "SN", name: "Senegal", cities: ["Dakar", "Touba", "Thiès", "Rufisque", "Kaolack", "Saint-Louis", "Ziguinchor"] },
  { code: "SC", name: "Seychelles", cities: ["Victoria", "Anse Boileau", "Beau Vallon", "Bel Ombre"] },
  { code: "SL", name: "Sierra Leone", cities: ["Freetown", "Bo", "Kenema", "Makeni", "Koidu"] },
  { code: "SO", name: "Somalia", cities: ["Mogadishu", "Hargeisa", "Kismayo", "Bosaso", "Berbera", "Baidoa"] },
  { code: "ZA", name: "South Africa", cities: ["Johannesburg", "Cape Town", "Durban", "Pretoria", "Port Elizabeth", "Bloemfontein", "East London", "Polokwane", "Nelspruit", "Kimberley", "Soweto"] },
  { code: "SS", name: "South Sudan", cities: ["Juba", "Wau", "Malakal", "Yei", "Bor", "Aweil"] },
  { code: "SD", name: "Sudan", cities: ["Khartoum", "Omdurman", "Port Sudan", "Kassala", "Nyala", "El Obeid"] },
  { code: "TZ", name: "Tanzania", cities: ["Dar es Salaam", "Dodoma", "Mwanza", "Arusha", "Mbeya", "Zanzibar City", "Morogoro", "Tanga"] },
  { code: "TG", name: "Togo", cities: ["Lomé", "Sokodé", "Kara", "Kpalimé", "Atakpamé"] },
  { code: "TN", name: "Tunisia", cities: ["Tunis", "Sfax", "Sousse", "Kairouan", "Bizerte", "Gabès"] },
  { code: "UG", name: "Uganda", cities: ["Kampala", "Gulu", "Lira", "Mbarara", "Jinja", "Mbale", "Entebbe", "Fort Portal"] },
  { code: "ZM", name: "Zambia", cities: ["Lusaka", "Kitwe", "Ndola", "Kabwe", "Chingola", "Mufulira", "Livingstone"] },
  { code: "ZW", name: "Zimbabwe", cities: ["Harare", "Bulawayo", "Chitungwiza", "Mutare", "Gweru", "Kwekwe", "Kadoma", "Masvingo"] },
];

export function findCountry(name: string | null | undefined): CountryData | undefined {
  if (!name) return undefined;
  const n = name.trim().toLowerCase();
  return AFRICA_COUNTRIES.find((c) => c.name.toLowerCase() === n || c.code.toLowerCase() === n);
}

/** Compact display string: "Area, City, Country" — omits blanks. */
export function formatLocation(country?: string | null, city?: string | null, area?: string | null): string {
  return [area, city, country].filter((v) => v && v.trim()).join(", ");
}
