export type RideshareProvider = {
  id: string;
  name: string;
  color: string;
  textColor?: string;
};

export type RideshareLink = RideshareProvider & {
  url: string;
};

type ProviderDef = RideshareProvider & {
  buildUrl: (origin: string, destination: string) => string;
};

const PROVIDERS: Record<string, ProviderDef> = {
  uber: {
    id: "uber",
    name: "Uber",
    color: "#000000",
    buildUrl(origin, destination) {
      const params = new URLSearchParams();
      params.set("pickup[formatted_address]", origin);
      params.set("drop[0][formatted_address]", destination);
      return `https://m.uber.com/looking?${params.toString()}`;
    },
  },
  bolt: {
    id: "bolt",
    name: "Bolt",
    color: "#34D186",
    buildUrl(origin, destination) {
      const params = new URLSearchParams();
      params.set("pickup", origin);
      params.set("dropoff", destination);
      return `https://ride.bolt.eu/route?${params.toString()}`;
    },
  },
  lyft: {
    id: "lyft",
    name: "Lyft",
    color: "#FF00BF",
    buildUrl(origin, destination) {
      const params = new URLSearchParams();
      params.set("pickup[address]", origin);
      params.set("destination[address]", destination);
      return `https://www.lyft.com/rider/routes?${params.toString()}`;
    },
  },
  grab: {
    id: "grab",
    name: "Grab",
    color: "#00B14F",
    buildUrl(origin, destination) {
      const params = new URLSearchParams();
      params.set("pickup", origin);
      params.set("dropoff", destination);
      return `https://transport.grab.com/book?${params.toString()}`;
    },
  },
  ola: {
    id: "ola",
    name: "Ola",
    color: "#1FA637",
    buildUrl(origin, destination) {
      const params = new URLSearchParams();
      params.set("pickup", origin);
      params.set("drop", destination);
      return `https://book.olacabs.com/?${params.toString()}`;
    },
  },
  careem: {
    id: "careem",
    name: "Careem",
    color: "#4CAF50",
    buildUrl(origin, destination) {
      const params = new URLSearchParams();
      params.set("pickup", origin);
      params.set("dropoff", destination);
      return `https://app.careem.com/book?${params.toString()}`;
    },
  },
  freenow: {
    id: "freenow",
    name: "Free Now",
    color: "#E30613",
    buildUrl(origin, destination) {
      const params = new URLSearchParams();
      params.set("pickupAddress", origin);
      params.set("destinationAddress", destination);
      return `https://free-now.com/deeplink/booking?${params.toString()}`;
    },
  },
  cabify: {
    id: "cabify",
    name: "Cabify",
    color: "#7B3FF2",
    buildUrl(origin, destination) {
      const params = new URLSearchParams();
      params.set("from", origin);
      params.set("to", destination);
      return `https://cabify.com/rider/routes?${params.toString()}`;
    },
  },
  heetch: {
    id: "heetch",
    name: "Heetch",
    color: "#FF6B6B",
    buildUrl(origin, destination) {
      const params = new URLSearchParams();
      params.set("pickup", origin);
      params.set("dropoff", destination);
      return `https://www.heetch.com/book?${params.toString()}`;
    },
  },
  didi: {
    id: "didi",
    name: "DiDi",
    color: "#FF7A00",
    buildUrl(origin, destination) {
      const params = new URLSearchParams();
      params.set("fromlat", origin);
      params.set("tolat", destination);
      return `https://web.didiglobal.com/ride?${params.toString()}`;
    },
  },
};

const REGION_PROVIDERS: Array<{ match: RegExp; providerIds: string[] }> = [
  {
    match:
      /united states|usa|\bus\b|new york|nyc|los angeles|san francisco|chicago|miami|boston|seattle|austin|denver|atlanta|washington dc|philadelphia|houston|dallas|portland|san diego|las vegas|phoenix|detroit|minneapolis|nashville|orlando|tampa|charlotte|baltimore|pittsburgh|st\.? louis|kansas city|salt lake|honolulu|new orleans|raleigh|indianapolis|columbus|milwaukee|jacksonville|memphis|louisville|richmond|buffalo|tucson|albuquerque|fresno|sacramento|long beach|oakland|bakersfield|anaheim|santa ana|riverside|stockton|irvine|chula vista|fremont|san jose|glendale|huntington beach|modesto|oxnard|moreno valley|fontana|santa clarita|overland park|grand rapids|huntsville|knoxville|worcester|providence|springfield|des moines|boise|spokane|tacoma|vancouver wa|bellevue|scottsdale|gilbert|chandler|mesa|tempe|glendale az|north las vegas|henderson|paradise|sunrise manor|enterprise|spring valley|sunset park|brooklyn|manhattan|queens|bronx|staten island|jersey city|newark|hoboken|cambridge|somerville|arlington va|alexandria|bethesda|silver spring|rockville|fairfax|annapolis|ann arbor|madison|annapolis|boulder|fort collins|colorado springs|asheville|charleston|savannah|santa fe|santa barbara|palm springs|palo alto|mountain view|sunnyvale|cupertino|berkeley|pasadena|beverly hills|santa monica|malibu|west hollywood|hollywood|downtown la|silicon valley|bay area|sf bay|tri-state|tri state|california|texas|florida|illinois|pennsylvania|ohio|georgia|north carolina|michigan|new jersey|virginia|washington state|arizona|massachusetts|tennessee|indiana|missouri|maryland|wisconsin|colorado|minnesota|south carolina|alabama|louisiana|kentucky|oregon|oklahoma|connecticut|utah|iowa|nevada|arkansas|mississippi|kansas|new mexico|nebraska|idaho|west virginia|hawaii|new hampshire|maine|montana|rhode island|delaware|south dakota|north dakota|alaska|vermont|wyoming/i,
    providerIds: ["uber", "lyft"],
  },
  {
    match:
      /canada|toronto|vancouver|montreal|calgary|edmonton|ottawa|winnipeg|quebec city|hamilton|mississauga|brampton|surrey|burnaby|victoria bc|halifax|saskatoon|regina|london ontario|kitchener|windsor|oshawa|barrie|kelowna|nanaimo|whistler|banff|mont-tremblant|niagara/i,
    providerIds: ["uber", "lyft"],
  },
  {
    match:
      /india|mumbai|delhi|new delhi|bangalore|bengaluru|chennai|hyderabad|kolkata|pune|ahmedabad|jaipur|surat|lucknow|kanpur|nagpur|indore|bhopal|visakhapatnam|patna|vadodara|ghaziabad|ludhiana|agra|nashik|faridabad|meerut|rajkot|varanasi|srinagar|aurangabad|dhanbad|amritsar|allahabad|prayagraj|ranchi|coimbatore|jabalpur|gwalior|vijayawada|jodhpur|madurai|raipur|kota|guwahati|chandigarh|solapur|hubli|mysore|tiruchirappalli|bareilly|aligarh|moradabad|jalandhar|bhubaneswar|salem|warangal|guntur|bhiwandi|saharanpur|gorakhpur|bikaner|amravati|noida|gurugram|gurgaon|faridabad|thane|navi mumbai|goa|panaji|kochi|kozhikode|trivandrum|thiruvananthapuram|shimla|manali|udaipur|jaisalmer|agra|kerala|tamil nadu|maharashtra|gujarat|rajasthan|punjab|haryana|uttar pradesh|west bengal|karnataka|telangana|andhra pradesh|madhya pradesh|bihar|odisha|assam|jharkhand|chhattisgarh|himachal|uttarakhand|jammu|kashmir|ladakh|pondicherry|puducherry/i,
    providerIds: ["uber", "ola"],
  },
  {
    match:
      /china|beijing|shanghai|guangzhou|shenzhen|chengdu|hangzhou|xi'an|nanjing|wuhan|chongqing|tianjin|suzhou|qingdao|dalian|xiamen|zhengzhou|changsha|kunming|harbin|urumqi|lhasa|hong kong|macau|taiwan|taipei|kaohsiung/i,
    providerIds: ["didi", "uber"],
  },
  {
    match: /japan|tokyo|osaka|kyoto|yokohama|nagoya|sapporo|fukuoka|hiroshima|nara|kanazawa|hakone|okinawa/i,
    providerIds: ["uber"],
  },
  {
    match: /south korea|korea|seoul|busan|incheon|jeju|daegu|gwangju/i,
    providerIds: ["uber"],
  },
  {
    match:
      /singapore|thailand|bangkok|chiang mai|phuket|pattaya|vietnam|hanoi|ho chi minh|saigon|da nang|malaysia|kuala lumpur|penang|johor|indonesia|jakarta|bali|surabaya|bandung|philippines|manila|cebu|davao|cambodia|phnom penh|siem reap|myanmar|yangon|laos|vientiane|brunei|sri lanka|colombo|nepal|kathmandu|bangladesh|dhaka|se asia|southeast asia/i,
    providerIds: ["grab"],
  },
  {
    match: /pakistan|karachi|lahore|islamabad|rawalpindi|faisalabad|multan/i,
    providerIds: ["uber", "careem"],
  },
  {
    match:
      /uae|dubai|abu dhabi|sharjah|saudi arabia|riyadh|jeddah|mecca|medina|dammam|qatar|doha|bahrain|manama|kuwait|oman|muscat|jordan|amman|lebanon|beirut|egypt|cairo|alexandria|giza|morocco|casablanca|marrakech|rabat|tunisia|tunis|algeria|algiers|iraq|baghdad|iran|tehran|israel|tel aviv|jerusalem|palestine|west bank|middle east|mena|gcc|gulf/i,
    providerIds: ["uber", "careem"],
  },
  {
    match:
      /mexico|mexico city|guadalajara|monterrey|cancun|tulum|playa del carmen|merida|puebla|colombia|bogota|medellin|cali|cartagena|brazil|sao paulo|rio de janeiro|brasilia|salvador|fortaleza|belo horizonte|curitiba|recife|porto alegre|manaus|argentina|buenos aires|cordoba|mendoza|chile|santiago|valparaiso|peru|lima|cusco|machu picchu|ecuador|quito|guayaquil|uruguay|montevideo|paraguay|asuncion|bolivia|la paz|venezuela|caracas|costa rica|san jose|panama|panama city|guatemala|guatemala city|dominican republic|santo domingo|puerto rico|san juan|latin america|south america|central america|caribbean|cuba|havana|jamaica|kingston|trinidad|barbados|bahamas|nassau|honduras|tegucigalpa|el salvador|san salvador|nicaragua|managua|belize|haiti|port-au-prince/i,
    providerIds: ["uber", "cabify"],
  },
  {
    match:
      /spain|madrid|barcelona|valencia|seville|malaga|bilbao|san sebastian|granada|cordoba|toledo|ibiza|mallorca|palma|canary islands|tenerife|gran canaria|portugal|lisbon|porto|faro|madeira|azores|andorra|gibraltar/i,
    providerIds: ["uber", "cabify", "bolt"],
  },
  {
    match:
      /france|paris|lyon|marseille|nice|cannes|monaco|bordeaux|toulouse|strasbourg|nantes|lille|montpellier|rennes|reims|grenoble|annecy|chamonix|normandy|provence|brittany|alsace|loire|dordogne|french riviera|cote d'azur|belgium|brussels|antwerp|ghent|bruges|liege|luxembourg|netherlands|amsterdam|rotterdam|the hague|utrecht|eindhoven|maastricht|holland/i,
    providerIds: ["uber", "bolt", "heetch"],
  },
  {
    match:
      /germany|berlin|munich|frankfurt|hamburg|cologne|koln|dusseldorf|stuttgart|leipzig|dresden|nuremberg|hanover|bremen|bonn|heidelberg|freiburg|munster|aachen|dortmund|essen|duisburg|bochum|wuppertal|bielefeld|bonn|karlsruhe|mannheim|augsburg|wiesbaden|monchengladbach|braunschweig|chemnitz|kiel|halle|magdeburg|freiburg|krefeld|lubeck|oberhausen|erfurt|mainz|rostock|kassel|hagen|saarbrucken|hamm|mulheim|potsdam|ludwigshafen|oldenburg|osnabruck|leverkusen|heidelberg|darmstadt|solingen|regensburg|paderborn|ingolstadt|wurzburg|furth|ulm|heilbronn|pforzheim|gottingen|bottrop|trier|recklinghausen|reutlingen|bremerhaven|koblenz|bergisch|jena|remscheid|erlangen|moers|siegen|hildesheim|salzgitter|cottbus|kaiserslautern|gutersloh|schwerin|witten|gera|ispingen|ludwigsburg|marburg|konstanz|flensburg|brandenburg|bamberg|aschaffenburg|bayreuth|landshut|rosenheim|passau|regensburg|weimar|quedlinburg|trier|triberg|black forest|bavaria|saxony|rhine|ruhr|austria|vienna|wien|salzburg|innsbruck|graz|linz|hallstatt|zell am see|kitzbuhel|switzerland|zurich|geneva|genf|basel|bern|berne|lucerne|luzern|interlaken|zermatt|lausanne|lugano|st moritz|davos|liechtenstein|vaduz|central europe|dach|alps|tyrol|tirol|carinthia|styria|vorarlberg|upper austria|lower austria|burgenland/i,
    providerIds: ["uber", "bolt", "freenow"],
  },
  {
    match:
      /italy|rome|roma|milan|milano|florence|firenze|venice|venezia|naples|napoli|turin|torino|bologna|genoa|genova|palermo|catania|verona|padua|padova|trieste|brescia|parma|modena|reggio|perugia|livorno|ravenna|cagliari|ferrara|rimini|salerno|sassari|monza|bergamo|forli|trento|vicenza|terni|bolzano|novara|piacenza|ancona|andria|arezzo|udine|cesena|lecce|pesaro|barletta|la spezia|taranto|prato|modena|lucca|pisa|siena|amalfi|capri|sicily|sicilia|sardinia|sardegna|tuscany|toscana|umbria|lombardy|lombardia|campania|piedmont|piemonte|liguria|emilia|romagna|marche|abruzzo|molise|basilicata|calabria|puglia|apulia|friuli|trentino|alto adige|san marino|vatican/i,
    providerIds: ["uber", "bolt", "freenow"],
  },
  {
    match:
      /united kingdom|uk|\bengland\b|scotland|wales|northern ireland|london|manchester|birmingham|leeds|glasgow|edinburgh|liverpool|bristol|sheffield|newcastle|nottingham|leicester|coventry|cardiff|belfast|aberdeen|southampton|portsmouth|brighton|hove|plymouth|reading|derby|wolverhampton|swansea|oxford|cambridge|york|bath|canterbury|exeter|norwich|bournemouth|milton keynes|northampton|luton|preston|stoke|hull|dundee|inverness|stirling|durham|chester|harrogate|stratford|lake district|cornwall|devon|somerset|kent|sussex|essex|suffolk|norfolk|yorkshire|lancashire|cheshire|merseyside|tyne|wear|highlands|isles|britain|great britain|gb\b|ireland|dublin|cork|galway|limerick|waterford|kilkenny|belfast|derry|killarney|ring of kerry|cliffs of moher|eire|republic of ireland|northern ireland|british isles/i,
    providerIds: ["uber", "bolt"],
  },
  {
    match:
      /poland|warsaw|krakow|wroclaw|gdansk|poznan|lodz|katowice|lublin|szczecin|bydgoszcz|bialystok|torun|rzeszow|kielce|gliwice|zabrze|olsztyn|bytom|rybnik|tarnow|opole|gorzow|elblag|plock|walbrzych|wloclawek|tarnowskie|chorzow|kalisz|koszalin|legnica|grudziadz|slupsk|jaworzno|jastrzebie|nowy sacz|jelenia|konin|piotrkow|inowroclaw|lubin|ostrow|stargard|myslowice|piła|gniezno|sosnowiec|tczew|zamosc|przemysl|stalowa|wola|mielec|tczew|belchatow|radom|siedlce|czestochowa|gdynia|sopot|zakopane|malbork|wieliczka|auschwitz|baltic|eastern europe|baltics|estonia|tallinn|latvia|riga|lithuania|vilnius|kaunas|klaipeda|czech|czechia|prague|brno|ostrava|plzen|cesky|krumlov|karlovy|vary|slovakia|bratislava|kosice|hungary|budapest|debrecen|szeged|pecs|gyor|romania|bucharest|cluj|timisoara|iasi|brasov|sibiu|constanta|bulgaria|sofia|plovdiv|varna|burgas|croatia|zagreb|split|dubrovnik|zadar|rijeka|pula|hvar|korcula|slovenia|ljubljana|bled|serbia|belgrade|novi sad|bosnia|sarajevo|mostar|montenegro|podgorica|kotor|budva|albania|tirana|north macedonia|skopje|kosovo|pristina|moldova|chisinau|ukraine|kyiv|kiev|lviv|odessa|kharkiv|dnipro|belarus|minsk|greece|athens|thessaloniki|patras|heraklion|rhodes|corfu|santorini|mykonos|crete|kreta|cyprus|nicosia|limassol|larnaca|paphos|malta|valletta|sliema|turkey|istanbul|ankara|izmir|antalya|bodrum| cappadocia|bursa|adana|gaziantep|konya|marmaris|fethiye|pamukkale|ephesus|troy|balkans|scandinavia|sweden|stockholm|gothenburg|malmo|uppsala|norway|oslo|bergen|trondheim|tromso|denmark|copenhagen|aarhus|odense|aalborg|finland|helsinki|turku|tampere|rovaniemi|lapland|iceland|reykjavik|akureyri|europe/i,
    providerIds: ["uber", "bolt"],
  },
  {
    match:
      /australia|sydney|melbourne|brisbane|perth|adelaide|gold coast|canberra|hobart|darwin|cairns|byron bay|great barrier reef|uluru|ayers rock|tasmania|queensland|victoria|new south wales|western australia|south australia|northern territory|act|new zealand|auckland|wellington|christchurch|queenstown|rotorua|taupo|dunedin|nelson|bay of plenty|fiordland|milford sound|oceania|anz/i,
    providerIds: ["uber"],
  },
  {
    match:
      /south africa|johannesburg|cape town|durban|pretoria|port elizabeth|bloemfontein|kenya|nairobi|mombasa|nigeria|lagos|abuja|ghana|accra|tanzania|dar es salaam|zanzibar|arusha|uganda|kampala|ethiopia|addis ababa|morocco|casablanca|tunisia|senegal|dakar|ivory coast|abidjan|cameroon|douala|yaounde|zimbabwe|harare|zambia|lusaka|botswana|gaborone|namibia|windhoek|mozambique|maputo|angola|luanda|rwanda|kigali|mauritius|port louis|seychelles|madagascar|antananarivo|africa|sub-saharan|north africa|east africa|west africa|southern africa/i,
    providerIds: ["uber", "bolt"],
  },
];

const DEFAULT_PROVIDER_IDS = ["uber", "bolt"];

function getProviderIdsForLocation(location: string): string[] {
  for (const region of REGION_PROVIDERS) {
    if (region.match.test(location)) {
      return region.providerIds;
    }
  }
  return DEFAULT_PROVIDER_IDS;
}

export function buildRideshareLinks(
  origin: string,
  destination: string,
  tripDestination: string
): RideshareLink[] {
  const providerIds = getProviderIdsForLocation(tripDestination);

  return providerIds
    .map((id) => PROVIDERS[id])
    .filter(Boolean)
    .map((provider) => ({
      id: provider.id,
      name: provider.name,
      color: provider.color,
      textColor: provider.textColor,
      url: provider.buildUrl(origin, destination),
    }));
}
