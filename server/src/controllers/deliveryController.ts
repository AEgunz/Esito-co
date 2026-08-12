import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getDeliveryFees = async (req: Request, res: Response) => {
  try {
    const fees = await prisma.deliveryFee.findMany({
      orderBy: { city: 'asc' }
    });
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching delivery fees' });
  }
};

export const getDeliveryFeeByCity = async (req: Request, res: Response) => {
  try {
    const city = req.params.city as string;
    // Database cities are stored in lowercase
    const fee = await prisma.deliveryFee.findUnique({
      where: { city: city.toLowerCase() }
    });
    res.json(fee || { city, fee: 30 }); // Default 30 if not found
  } catch (error) {
    res.status(500).json({ message: 'Error fetching delivery fee' });
  }
};

export const upsertDeliveryFee = async (req: Request, res: Response) => {
  try {
    const { city, fee, ameexId } = req.body;
    const deliveryFee = await prisma.deliveryFee.upsert({
      where: { city: city.toLowerCase() },
      update: { fee: Number(fee), ameexId },
      create: { city: city.toLowerCase(), fee: Number(fee), ameexId }
    });
    res.json(deliveryFee);
  } catch (error) {
    res.status(500).json({ message: 'Error saving delivery fee' });
  }
};

export const deleteDeliveryFee = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.deliveryFee.delete({ where: { id } });
    res.json({ message: 'Delivery fee deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting delivery fee' });
  }
};

export const seedDeliveryFees = async (req: Request, res: Response) => {
  try {
    const deliveryData = [
      { city: "Marrakech", fee: 35 }, { city: "Meknes", fee: 35 }, { city: "Mhaya", fee: 45 },
      { city: "Ain Taoujdate", fee: 45 }, { city: "Sabaa Aiyoun", fee: 45 }, { city: "Boufakrane", fee: 45 },
      { city: "El Hajeb", fee: 45 }, { city: "Bouderbala", fee: 45 }, { city: "Boujdour", fee: 45 },
      { city: "Tetouan", fee: 35 }, { city: "Martil", fee: 40 }, { city: "M Diq", fee: 45 },
      { city: "Fnideq", fee: 40 }, { city: "Errachidia", fee: 40 }, { city: "Oujda", fee: 35 },
      { city: "Nador", fee: 40 }, { city: "Selouane", fee: 45 }, { city: "Al Aaroui", fee: 45 },
      { city: "Zaio", fee: 45 }, { city: "Driouch", fee: 45 }, { city: "Khouribga", fee: 35 },
      { city: "Oued Zem", fee: 40 }, { city: "Boulanouar", fee: 45 }, { city: "Boujniba", fee: 45 },
      { city: "Bir Mezoui", fee: 45 }, { city: "Khemisset", fee: 40 }, { city: "Tiflet", fee: 40 },
      { city: "Mohammedia", fee: 30 }, { city: "Ain Harrouda", fee: 35 }, { city: "Dakhla", fee: 45 },
      { city: "Kenitra", fee: 35 }, { city: "Sidi Taibi", fee: 40 }, { city: "Sidi Yahya El Gharb", fee: 45 },
      { city: "Mechra Bel Ksiri", fee: 45 }, { city: "Sidi Sliman (reg kacem)", fee: 45 }, { city: "Sidi Kacem", fee: 45 },
      { city: "Mehdya", fee: 45 }, { city: "Tan Tan", fee: 45 }, { city: "Guelmim", fee: 45 },
      { city: "Bouizakarne", fee: 45 }, { city: "Atlas Saghir ifrane", fee: 45 }, { city: "Timoulay", fee: 45 },
      { city: "Sidi Ifni", fee: 45 }, { city: "Rabat", fee: 35 }, { city: "Sale", fee: 35 },
      { city: "Sale Al Jadida-سلا", fee: 35 }, { city: "Temara", fee: 35 }, { city: "Tamesna", fee: 45 },
      { city: "Skhirat", fee: 40 }, { city: "Ouarzazat", fee: 40 }, { city: "Ait Zineb", fee: 45 },
      { city: "Tabounte", fee: 45 }, { city: "Tajda", fee: 45 }, { city: "Timdline", fee: 45 },
      { city: "Tifoultoute", fee: 45 }, { city: "Ifran", fee: 45 }, { city: "Azrou(reg meknes)", fee: 45 },
      { city: "Agadir", fee: 35 }, { city: "Inzegane", fee: 40 }, { city: "Dcheira", fee: 45 },
      { city: "Ait Meloul", fee: 45 }, { city: "Sidi Bibi - Agadir", fee: 45 }, { city: "Taghazoute", fee: 45 },
      { city: "Fes", fee: 35 }, { city: "Ain Bida", fee: 45 }, { city: "Oulad Ettayeb", fee: 45 },
      { city: "Ain Allah", fee: 45 }, { city: "Sidi Harazem", fee: 45 }, { city: "Essmara", fee: 45 },
      { city: "Berrchid", fee: 35 }, { city: "Settat", fee: 35 }, { city: "Deroua", fee: 35 },
      { city: "Nouaceur", fee: 35 }, { city: "Had Soualem", fee: 30 }, { city: "Al Hoceima", fee: 40 },
      { city: "Ajdir (Région Hociema)", fee: 45 }, { city: "Boukidaren", fee: 45 }, { city: "Ait Kamra", fee: 45 },
      { city: "Imzouren", fee: 45 }, { city: "Youssoufia", fee: 40 }, { city: "Essaouira", fee: 40 },
      { city: "Ounagha", fee: 40 }, { city: "Taftecht", fee: 45 }, { city: "Had Draa", fee: 45 },
      { city: "Mejji", fee: 45 }, { city: "Talmest", fee: 45 }, { city: "Akermoud", fee: 45 },
      { city: "Zaouiet Bouzarktoune", fee: 45 }, { city: "Ghazoua", fee: 45 }, { city: "Smimou", fee: 45 },
      { city: "Tamanar", fee: 45 }, { city: "Sidi Kaouki", fee: 45 }, { city: "Tanger", fee: 35 },
      { city: "Mrirt", fee: 45 }, { city: "Khenifra", fee: 45 }, { city: "Ben Guerir", fee: 40 },
      { city: "Taroudannt", fee: 45 }, { city: "Oulad Teima", fee: 45 }, { city: "Ait Laaza", fee: 45 },
      { city: "Aoulouz", fee: 45 }, { city: "Taliouine", fee: 45 }, { city: "Sebt El Guerdane", fee: 45 },
      { city: "Berkane", fee: 45 }, { city: "Saidia", fee: 45 }, { city: "Ras El Ma (REG NADOR)", fee: 45 },
      { city: "Bni Drar", fee: 45 }, { city: "Ahfir", fee: 45 }, { city: "Aklim", fee: 45 },
      { city: "Zeghanghane", fee: 45 }, { city: "Farkhana", fee: 45 }, { city: "Taza", fee: 40 },
      { city: "Guercif", fee: 45 }, { city: "Tiznit", fee: 45 }, { city: "Safi", fee: 40 },
      { city: "Had Hrara", fee: 45 }, { city: "Sebt Gzoula", fee: 45 }, { city: "Larache", fee: 35 },
      { city: "Ksar El Kebir", fee: 45 }, { city: "Chefchaouen", fee: 45 }, { city: "Sidi Bernoussi", fee: 20 },
      { city: "Casablanca", fee: 20 }, { city: "Sidi Messaoud", fee: 30 }, { city: "Bouskoura", fee: 30 },
      { city: "Dar Bouaza", fee: 30 }, { city: "Mediouna", fee: 30 }, { city: "Tit Melil", fee: 30 },
      { city: "El Kelaa Des Sraghna", fee: 45 }, { city: "El Jadida", fee: 35 }, { city: "Sidi Bouzid", fee: 40 },
      { city: "Oualidia", fee: 40 }, { city: "Sidi Bennour", fee: 45 }, { city: "Beni Ansar", fee: 45 },
      { city: "Izemmouren", fee: 45 }, { city: "Laayoune", fee: 45 }, { city: "El Marsa", fee: 45 },
      { city: "Beni Mellal", fee: 35 }, { city: "Fquih Ben Salah", fee: 40 }, { city: "Sebt Oulad Nemma", fee: 45 },
      { city: "Afourer", fee: 45 }, { city: "Ouled Yaiche", fee: 45 }, { city: "El Ksiba", fee: 45 },
      { city: "Ain Aouda", fee: 45 }, { city: "Tamansourt", fee: 45 }, { city: "Benslimane ( reg mohamedia)", fee: 40 },
      { city: "Kasbah Tadla", fee: 45 }, { city: "Chemaia", fee: 45 }, { city: "Ourika", fee: 45 },
      { city: "Tahannaout", fee: 45 }, { city: "Ait Ourir", fee: 45 }, { city: "Oudaya", fee: 45 },
      { city: "Chichaoua", fee: 45 }, { city: "Assilah", fee: 45 }, { city: "Bouznika", fee: 35 },
      { city: "Sefrou", fee: 45 }, { city: "Taourirt", fee: 45 }, { city: "Chouiter", fee: 45 },
      { city: "Sidi Allal el Bahraoui", fee: 40 }, { city: "Romani", fee: 45 }, { city: "Oulmas", fee: 45 },
      { city: "Ouazzane", fee: 40 }, { city: "Ain Dorij", fee: 45 }, { city: "Sidi Redouane", fee: 45 },
      { city: "Moqrisset", fee: 45 }, { city: "Zoumi", fee: 45 }, { city: "Harhoura", fee: 40 },
      { city: "Laattaouia", fee: 45 }, { city: "Rissani", fee: 45 }, { city: "Arfoud", fee: 45 },
      { city: "Merzouga", fee: 45 }, { city: "Taddart - TAZA -", fee: 45 }, { city: "Bni Bouayach", fee: 45 },
      { city: "Azilal", fee: 45 }, { city: "Ouaouizeght", fee: 45 }, { city: "Bejaad", fee: 45 },
      { city: "Tinghir", fee: 45 }, { city: "Boumalne Dades", fee: 45 }, { city: "Kalaat MGouna", fee: 45 },
      { city: "Alnif", fee: 45 }, { city: "Bou Adel", fee: 45 }, { city: "Zrizer", fee: 45 },
      { city: "Ain Aicha", fee: 45 }, { city: "Taounate", fee: 45 }, { city: "Awrir", fee: 45 },
      { city: "Ait amira", fee: 45 }, { city: "Belfaa", fee: 45 }, { city: "Anza", fee: 45 },
      { city: "DERDARA", fee: 45 }, { city: "Bab Taza", fee: 45 }, { city: "AKCHOUR", fee: 45 },
      { city: "Bab berred", fee: 45 }, { city: "El Jebeha", fee: 45 }, { city: "Midelt", fee: 45 },
      { city: "Jerada", fee: 45 }, { city: "Bouarfa", fee: 45 }, { city: "Laayoun Cherqia", fee: 45 },
      { city: "Zagora", fee: 45 }, { city: "Tamegroute", fee: 45 }, { city: "Tagomite", fee: 45 },
      { city: "Mhamid Lghezlane", fee: 45 }, { city: "Agdz", fee: 45 }, { city: "Nkob", fee: 45 },
      { city: "Tazzarine", fee: 45 }, { city: "Taghbalte", fee: 45 }, { city: "Errich", fee: 45 },
      { city: "Missour", fee: 45 }, { city: "Boumia", fee: 45 }, { city: "Tinjdad", fee: 45 },
      { city: "Gulmima - errachidia", fee: 45 }, { city: "Sidi Bouknadel", fee: 40 }, { city: "Imintanoute", fee: 45 },
      { city: "Demnate", fee: 45 }, { city: "Ouad Laou", fee: 45 }, { city: "Cabo Negro", fee: 45 },
      { city: "Khmiss Zemamera", fee: 45 }, { city: "Sidi Smail", fee: 45 }, { city: "Oulad Fraj", fee: 45 },
      { city: "Mellalyène", fee: 45 }, { city: "Sidi Rehal-casa", fee: 40 }, { city: "Assa", fee: 45 },
      { city: "Rehamna", fee: 45 }, { city: "Lakhssas", fee: 45 }, { city: "Aoufous", fee: 45 },
      { city: "Boudnib", fee: 45 }, { city: "Ben Ahmed - Settat -", fee: 40 }, { city: "Sidi Bou Othmane", fee: 45 },
      { city: "Asni", fee: 45 }, { city: "Souk Elarbaa Du Gharb", fee: 45 }, { city: "Ajdir (Région Taza)", fee: 45 },
      { city: "Amizmiz", fee: 45 }, { city: "Drarga", fee: 40 }, { city: "Anza - Taddart", fee: 40 },
      { city: "Zayda", fee: 45 }, { city: "Outat El Haj", fee: 45 }, { city: "Tahla", fee: 45 },
      { city: "Oued Amlil", fee: 45 }, { city: "Imouzzer Kandar", fee: 45 }, { city: "Biogra", fee: 45 },
      { city: "Terfaya", fee: 45 }, { city: "Tazenakht", fee: 45 }, { city: "Figuig", fee: 45 },
      { city: "Tendrara", fee: 45 }, { city: "Beni Tajjite", fee: 45 }, { city: "Bouanane", fee: 45 },
      { city: "Tata", fee: 45 }, { city: "Mzoudia", fee: 40 }, { city: "Ksar Sghir", fee: 45 },
      { city: "Tamelelt", fee: 45 }, { city: "El Gara", fee: 40 }, { city: "Mirleft", fee: 45 },
      { city: "lqliaa", fee: 45 }, { city: "oulad berhil", fee: 45 }, { city: "zaida", fee: 45 },
      { city: "targuist", fee: 45 }, { city: "issaguen", fee: 45 }, { city: "tala youssef", fee: 45 },
      { city: "Jaadar", fee: 45 }, { city: "Midar", fee: 45 }, { city: "Ben Taieb", fee: 45 },
      { city: "Kassita", fee: 45 }, { city: "Tafersit", fee: 45 }, { city: "Dar El Kebdani", fee: 45 },
      { city: "Oulad Settout", fee: 45 }, { city: "Bouarg", fee: 45 }, { city: "Arekmane", fee: 45 },
      { city: "Krona", fee: 45 }, { city: "Boudinar", fee: 45 }, { city: "Tamsamane", fee: 45 },
      { city: "Annual", fee: 45 }, { city: "BENI CHIKER", fee: 45 }, { city: "Mariouari", fee: 45 },
      { city: "Tiztoutine", fee: 45 }, { city: "Tamaris", fee: 40 }, { city: "Karia Be Mohammed", fee: 45 },
      { city: "Taddart - Charaf - AGADIR", fee: 35 }, { city: "Ben Ahmed - CHEFCHAOUEN -", fee: 45 },
      { city: "Tnine Chtouka (el jadida)", fee: 45 }, { city: "AIN CHGAG", fee: 45 }, { city: "Tafraoute", fee: 45 },
      { city: "Houara-oulad teima", fee: 45 }, { city: "ERRAHMA VILLE", fee: 30 }, { city: "azrou ait melloul", fee: 45 },
      { city: "Ben Yakhlef", fee: 40 }, { city: "El Mansouria", fee: 40 }, { city: "cap beddouza", fee: 45 },
      { city: "Jemâa-Shaim", fee: 45 }, { city: "El Borouj", fee: 45 }, { city: "oulad said settat", fee: 45 },
      { city: "sidi hajjaj (settat)", fee: 45 }, { city: "Ras El Ain (settat)", fee: 45 }, { city: "Guisser (settat)", fee: 45 },
      { city: "Lakhyayeta", fee: 40 }, { city: "Nzalat Laadam", fee: 45 }, { city: "Oulad Zidoh", fee: 45 },
      { city: "souiria Guedima (REG SAFI)", fee: 45 }, { city: "Jorf El Melha", fee: 45 }, { city: "Ain Beida", fee: 45 },
      { city: "Mokrisset", fee: 45 }, { city: "Oulad Ayad", fee: 45 }, { city: "AIN ATIQ", fee: 40 },
      { city: "Moulay Bousselham", fee: 40 }, { city: "Khenichet", fee: 45 }, { city: "Zoumi-Ouazzane", fee: 45 },
      { city: "Teroual - Ouazzane", fee: 45 }, { city: "Ain Dfali-Ouazzane", fee: 45 }, { city: "Masmouda - Ouazzane", fee: 45 },
      { city: "Stehat-Chefchaouen", fee: 45 }, { city: "Temsia-agadir", fee: 45 }, { city: "Tamraght", fee: 45 },
      { city: "Had bouhssoussen", fee: 45 }, { city: "Moulay bouazza khenifra", fee: 45 }, { city: "Tagzert", fee: 45 },
      { city: "Oulad M barek-Beni Mellal", fee: 45 }, { city: "Tanougha-Beni Mellal", fee: 45 }, { city: "Foum Oudi", fee: 45 },
      { city: "Ikhourbane", fee: 45 }, { city: "Zag-VILLE", fee: 45 }, { city: "El Ouatia", fee: 45 },
      { city: "Port of Tan-Tan", fee: 45 }, { city: "oulad oujih", fee: 45 }, { city: "Lalla Mimouna", fee: 45 },
      { city: "Dlalha", fee: 45 }, { city: "Mers El Kheir", fee: 45 }, { city: "Sidi Yahya Zaer", fee: 45 },
      { city: "Skhour Rehamna", fee: 45 }, { city: "Amizmiz", fee: 45 }, { city: "El Hanchane", fee: 45 },
      { city: "Akka-tata", fee: 45 }, { city: "Tagmout-tata", fee: 45 }, { city: "Issafen-tata", fee: 45 },
      { city: "Fam El Hisn-tata", fee: 45 }, { city: "MASSA", fee: 45 }, { city: "Kariat Arkman‎-Nador", fee: 45 },
      { city: "Had Hrara-SAFI", fee: 45 }, { city: "Sidi Zouine", fee: 45 }, { city: "Skoura-Ouarzazate", fee: 45 },
      { city: "Bni hdifa - Region Al hoceima", fee: 45 }, { city: "Bab Marzouka-Taza", fee: 45 }, { city: "Aknoul-taza", fee: 45 },
      { city: "Hatane-Khouribga", fee: 45 }, { city: "sidi allal tazi", fee: 45 }, { city: "Tiddas", fee: 45 },
      { city: "Ain Johra", fee: 45 }, { city: "Maâziz", fee: 45 }, { city: "Tīdās-Khemisset", fee: 45 },
      { city: "Laouamra- ksar el kebir", fee: 45 }, { city: "Khemis Sahel", fee: 45 }, { city: "Krimda", fee: 45 },
      { city: "Sidi Aissa-Beni-Mellal", fee: 45 }, { city: "Ouled Moussa-Beni Mellal", fee: 45 }, { city: "Oulad Said-Beni Mellal", fee: 45 },
      { city: "ighram laalam-beni mellal", fee: 45 }, { city: "Zaouiat Cheikh", fee: 45 }, { city: "Ait Ali", fee: 45 },
      { city: "Lehri-KHENIFRA", fee: 45 }, { city: "El Kebab-KHENIFRA", fee: 45 }, { city: "El Borj-KHENIFRA", fee: 45 },
      { city: "Ouaoumana", fee: 45 }, { city: "Ait ishaq", fee: 45 }, { city: "Tighassaline ville", fee: 45 },
      { city: "Aguelmous", fee: 45 }, { city: "Bounouar", fee: 45 }, { city: "HATTANE", fee: 45 },
      { city: "Boujniba", fee: 45 }, { city: "Adouz", fee: 45 }, { city: "Foum El Anceur", fee: 45 },
      { city: "FERYATA", fee: 45 }, { city: "Foum Zaouia", fee: 45 }, { city: "Al kamoun-ksba tadla", fee: 45 },
      { city: "Jerf El Melha", fee: 45 }, { city: "Zemamra", fee: 45 }, { city: "Sidi Smail", fee: 45 },
      { city: "Azemmour", fee: 45 }, { city: "Bir Jdid", fee: 40 }, { city: "El Jorf Lasfar", fee: 45 },
      { city: "Moulay Abdallah Amghar", fee: 45 }, { city: "El Aouamra", fee: 45 }, { city: "Laarache", fee: 40 },
      { city: "Oulad Bourahma", fee: 40 }, { city: "Zone Franche (kenitra)", fee: 40 }, { city: "Ghafsai", fee: 45 },
      { city: "sidi aadi", fee: 45 }, { city: "Mejjat-chichaoua", fee: 45 }, { city: "Ain Tekki", fee: 45 },
      { city: "OULAD ABBOU-settat", fee: 45 }, { city: "AIN LEUH", fee: 45 }, { city: "Souihla", fee: 45 },
      { city: "El Haj Kaddour", fee: 45 }, { city: "Boulemane", fee: 45 }, { city: "Tin Mansour", fee: 45 },
      { city: "Arba Aounate", fee: 45 }, { city: "AIN BNI MATHAR", fee: 45 }, { city: "Tikiouine", fee: 45 },
      { city: "Chellalat Mohammedia", fee: 40 }, { city: "Zouada", fee: 45 }, { city: "Arbaoua", fee: 45 },
      { city: "Sidi el Aidi", fee: 45 }, { city: "DAR GUEDDARI", fee: 45 }, { city: "Tagadirt-Agadir", fee: 45 },
      { city: "Tadouaret-Agadir", fee: 45 }, { city: "Leqliaa - Taddart", fee: 45 }, { city: "ain mediouna - taounate", fee: 45 },
      { city: "ain aicha - taounate", fee: 45 }, { city: "zrizer - taounate", fee: 45 }, { city: "Ain Sbit", fee: 45 },
      { city: "MERCHOUCH", fee: 45 }, { city: "TANANTE-AZILAL", fee: 45 }, { city: "Birkouate", fee: 45 },
      { city: "Moulay Yaâcoub", fee: 45 }, { city: "sidi boujida", fee: 45 }, { city: "Oulad Tayeb", fee: 45 },
      { city: "Ain Chkef", fee: 45 }, { city: "Ouled Khlifa", fee: 45 }, { city: "LOUDAYA", fee: 45 },
      { city: "Tassoultante", fee: 45 }, { city: "Tameslouht", fee: 45 }, { city: "Sidi Moussa-OURIKA", fee: 45 },
      { city: "Gueznaia - Tanger", fee: 40 }, { city: "TANGER-bougdour", fee: 40 }, { city: "AIN DALIA-tanger", fee: 40 },
      { city: "Chraka - Tanger", fee: 40 }, { city: "TANGER-chaouia", fee: 40 }, { city: "tamchat", fee: 45 },
      { city: "TAGANTE", fee: 45 }, { city: "Moulay Idriss Zerhoun", fee: 45 }, { city: "BOUYAFAR", fee: 45 },
      { city: "Sidi Bousberr", fee: 45 }, { city: "LAMJAARA-ouazzane", fee: 45 }, { city: "BRIKCHA-ouazzane", fee: 45 },
      { city: "Beni Quolla-ouazzane", fee: 45 }, { city: "Mzefroune-ouazzane", fee: 45 }, { city: "Sidi Elmoukhtar - Chichaoua", fee: 45 },
      { city: "Ouled El Ghadbane", fee: 45 }, { city: "Had kourt", fee: 45 }, { city: "Madagh-berkan", fee: 45 },
      { city: "Laatamna", fee: 45 }, { city: "Sebt ben sassi", fee: 45 }, { city: "AIT BAHA", fee: 45 },
      { city: "Ribate El Kheir-sefrou", fee: 45 }, { city: "El Menzale-sefrou", fee: 45 }, { city: "Tizi Ouasli", fee: 45 },
      { city: "MSOUN taza", fee: 45 }, { city: "Akhfennir", fee: 45 }, { city: "Gfifat-oulad teima", fee: 45 },
      { city: "Oulad Dahou-HOUARA", fee: 45 }, { city: "TIMAHDITE-AZROU", fee: 45 }, { city: "AGOURAY", fee: 45 },
      { city: "SIDI AADI", fee: 45 }, { city: "Lalla Takerkoust", fee: 45 }, { city: "Oulad yahya-Marrakech", fee: 45 },
      { city: "Chrifia-Marrakech", fee: 45 }, { city: "Sidi Abdellah Ghiat", fee: 45 }, { city: "Ait Ben Haddou", fee: 45 },
      { city: "TALSINNT", fee: 45 }, { city: "Aouama-Tanger", fee: 40 }, { city: "Ras El Ain Rehamena- Tamelelt", fee: 45 },
      { city: "Tlauh - Tamelelt", fee: 45 }, { city: "EL AIOUN SIDI MELLOUK", fee: 45 }, { city: "Bir Tam Tam", fee: 45 },
      { city: "Ras Tabouda", fee: 45 }, { city: "Zaouia Bougrine", fee: 45 }, { city: "El houmer-taroudant", fee: 45 },
      { city: "Oulad Terna", fee: 45 }, { city: "Ouled Abbou-TAROUDANT", fee: 45 }, { city: "Oulad Aissa-TAROUDANT", fee: 45 },
      { city: "Tazemmourt-taroudant", fee: 45 }, { city: "tamaloukt-taroudant", fee: 45 }, { city: "nouail-taroudant", fee: 45 },
      { city: "oulad mhela-taroudant", fee: 45 }, { city: "El boura-taroudant", fee: 45 }, { city: "Oulad brahim-taroudant", fee: 45 },
      { city: "Sidi moussa lhamri-TAROUDANT", fee: 45 }, { city: "Ahmar laglalcha-taroudant", fee: 45 }, { city: "IGHREM-TATA", fee: 45 },
      { city: "ASJENN-ouazzane", fee: 45 }, { city: "TAFOUGHALT", fee: 45 }, { city: "AIN SFA-OUJDA", fee: 45 },
      { city: "Bouhouda-taounat", fee: 45 }, { city: "Tahar Souk-taounat", fee: 45 }, { city: "bouaadl-taounat", fee: 45 },
      { city: "Ouled azem-taounat", fee: 45 }, { city: "Tazouda-taounat", fee: 45 }, { city: "Timezgana-taounat", fee: 45 },
      { city: "Imouzzer Marmoucha", fee: 45 }, { city: "MEZRAOUA-taounat", fee: 45 }, { city: "Ait Yaazem-meknes", fee: 45 },
      { city: "Ourtzagh-taounat", fee: 45 }, { city: "Kasbat ayir-oualidia", fee: 45 }, { city: "Amerzgane", fee: 45 },
      { city: "Imini-Ouarzazate", fee: 45 }, { city: "LAMHIRIZ-dakhla", fee: 45 }, { city: "AIN SMEN-FES", fee: 40 },
      { city: "Idouirane-Imintanuot", fee: 45 }, { city: "Tamait Izder-agadir", fee: 45 }, { city: "Tinzouline-zagora", fee: 45 },
      { city: "BEN ZOLI", fee: 45 }, { city: "Tagounite", fee: 45 }, { city: "Ain el Mediour- taroudant", fee: 45 },
      { city: "Ouled Mssaad", fee: 45 }, { city: "Oulad Othmane", fee: 45 }, { city: "Oulad Yahya Lagraire", fee: 45 },
      { city: "Tinnegza", fee: 45 }, { city: "Ouled Moqaddem", fee: 45 }, { city: "Aït Attab", fee: 45 },
      { city: "Oulad Aissa- el jadida", fee: 45 }, { city: "BRADIA", fee: 45 }, { city: "Souk El Had Des Bradia", fee: 45 },
      { city: "Ouzoud", fee: 45 }, { city: "HOUARA-Tanger", fee: 45 }, { city: "MEHARZA-Tanger", fee: 45 },
      { city: "EL MNBAR-Tanger", fee: 45 }, { city: "AIN BELLOUT-Tanger", fee: 45 }, { city: "Agouim", fee: 45 },
      { city: "Ighrem N Ougdal", fee: 45 }, { city: "Tarmigt", fee: 45 }, { city: "Ain jiri", fee: 45 },
      { city: "Tlata Loulad Fini", fee: 45 }, { city: "Tnine Beni Meskine", fee: 45 }, { city: "Aghbalou N serdan", fee: 45 },
      { city: "Itzer-zaida", fee: 45 }, { city: "Zoualeth Dkhissa", fee: 45 }, { city: "Ras El Ma Fes", fee: 45 },
      { city: "Tassaout", fee: 45 }, { city: "Oued Jdida", fee: 45 }, { city: "Ouled Slim Khrarib", fee: 45 }
    ];

    console.log('Seeding delivery fees...');
    for (const item of deliveryData) {
      await prisma.deliveryFee.upsert({
        where: { city: item.city.toLowerCase() },
        update: { fee: Number(item.fee) },
        create: {
          city: item.city.toLowerCase(),
          fee: Number(item.fee)
        },
      });
    }

    res.json({ message: `Successfully seeded ${deliveryData.length} cities.` });
  } catch (error) {
    console.error('Seed Error:', error);
    res.status(500).json({ message: 'Error seeding delivery fees' });
  }
};
