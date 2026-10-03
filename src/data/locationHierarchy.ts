import { ALL_COUNTRY_PHONE_CODES, CountryPhoneCode } from './countryPhoneCodes';

export interface StateData {
  name: string;
  districts: string[];
}

export interface CountryLocationInfo {
  name: string;
  code: string;
  flag: string;
  postalCodeLabel: string;
  postalCodePlaceholder: string;
  states: StateData[];
}

// Comprehensive State & District hierarchy for student countries
export const COUNTRY_STATE_DISTRICT_MAP: Record<string, StateData[]> = {
  // INDIA - All 28 States & 8 Union Territories (Alphabetically ordered)
  India: [
    {
      name: 'Andaman and Nicobar Islands',
      districts: ['Nicobar', 'North and Middle Andaman', 'South Andaman (Port Blair)']
    },
    {
      name: 'Andhra Pradesh',
      districts: [
        'Anakapalli', 'Ananthapuramu (Anantapur)', 'Annamayya', 'Bapatla', 'Chittoor',
        'Dr. B.R. Ambedkar Konaseema', 'East Godavari (Rajamahendravaram)', 'Eluru',
        'Guntur', 'Kakinada', 'Krishna (Machilipatnam)', 'Kurnool', 'Nandyal',
        'NTR (Vijayawada)', 'Palnadu', 'Parvathipuram Manyam', 'Prakasam (Ongole)',
        'Sri Potti Sriramulu Nellore', 'Sri Sathya Sai', 'Srikakulam', 'Tirupati',
        'Visakhapatnam', 'Vizianagaram', 'West Godavari (Bhimavaram)', 'YSR Kadapa'
      ]
    },
    {
      name: 'Arunachal Pradesh',
      districts: [
        'Anjaw', 'Changlang', 'Dibang Valley', 'East Kameng', 'East Siang',
        'Kamle', 'Kra Daadi', 'Kurung Kumey', 'Leparada', 'Lohit', 'Longding',
        'Lower Dibang Valley', 'Lower Siang', 'Lower Subansiri', 'Namsai',
        'Pakke Kessang', 'Papum Pare (Itanagar)', 'Shi Yomi', 'Siang',
        'Tawang', 'Tirap', 'Upper Siang', 'Upper Subansiri', 'West Kameng', 'West Siang'
      ]
    },
    {
      name: 'Assam',
      districts: [
        'Baksa', 'Barpeta', 'Biswanath', 'Bongaigaon', 'Cachar (Silchar)', 'Charaideo',
        'Chirang', 'Darrang', 'Dhemaji', 'Dhubri', 'Dibrugarh', 'Dima Hasao',
        'Goalpara', 'Golaghat', 'Hailakandi', 'Hojai', 'Jorhat', 'Kamrup Metropolitan (Guwahati)',
        'Kamrup Rural', 'Karbi Anglong', 'Karimganj', 'Kokrajhar', 'Lakhimpur',
        'Majuli', 'Morigaon', 'Nagaon', 'Nalbari', 'Sivasagar', 'Sonitpur (Tezpur)',
        'South Salmara-Mankachar', 'Tamulpur', 'Tinsukia', 'Udalguri', 'West Karbi Anglong'
      ]
    },
    {
      name: 'Bihar',
      districts: [
        'Araria', 'Arwal', 'Aurangabad', 'Banka', 'Begusarai', 'Bhagalpur', 'Bhojpur (Arrah)',
        'Buxar', 'Darbhanga', 'East Champaran (Motihari)', 'Gaya', 'Gopalganj', 'Jamui',
        'Jehanabad', 'Kaimur (Bhabua)', 'Katihar', 'Khagaria', 'Kishanganj', 'Lakhisarai',
        'Madhepura', 'Madhubani', 'Munger', 'Muzaffarpur', 'Nalanda (Bihar Sharif)',
        'Nawada', 'Patna', 'Purnia', 'Rohtas (Sasaram)', 'Saharsa', 'Samastipur',
        'Saran (Chhapra)', 'Sheikhpura', 'Sheohar', 'Sitamarhi', 'Siwan', 'Supaul',
        'Vaishali (Hajipur)', 'West Champaran (Bettiah)'
      ]
    },
    {
      name: 'Chandigarh',
      districts: ['Chandigarh']
    },
    {
      name: 'Chhattisgarh',
      districts: [
        'Balod', 'Baloda Bazar', 'Balrampur', 'Bastar (Jagdalpur)', 'Bemetara', 'Bijapur',
        'Bilaspur', 'Dantewada', 'Dhamtari', 'Durg (Bhilai)', 'Gariaband', 'Gaurela-Pendra-Marwahi',
        'Janjgir-Champa', 'Jashpur', 'Kabirdham (Kawardha)', 'Kanker', 'Khairagarh-Chhuikhadan-Gandai',
        'Kondagaon', 'Korba', 'Korea', 'Mahasamund', 'Manendragarh-Chirmiri-Bharatpur',
        'Mohla-Manpur-Ambagarh Chowki', 'Mungeli', 'Narayanpur', 'Raigarh', 'Raipur',
        'Rajnandgaon', 'Sakti', 'Sarangarh-Bilaigarh', 'Sukma', 'Surajpur', 'Surguja (Ambikapur)'
      ]
    },
    {
      name: 'Dadra and Nagar Haveli and Daman and Diu',
      districts: ['Dadra and Nagar Haveli (Silvassa)', 'Daman', 'Diu']
    },
    {
      name: 'Delhi (NCT)',
      districts: [
        'Central Delhi', 'East Delhi', 'New Delhi', 'North Delhi', 'North East Delhi',
        'North West Delhi', 'Shahdara', 'South Delhi', 'South East Delhi', 'South West Delhi', 'West Delhi'
      ]
    },
    {
      name: 'Goa',
      districts: ['North Goa (Panaji)', 'South Goa (Margao, Vasco da Gama)']
    },
    {
      name: 'Gujarat',
      districts: [
        'Ahmedabad', 'Amreli', 'Anand', 'Aravalli', 'Banaskantha (Palanpur)', 'Bharuch',
        'Bhavnagar', 'Botad', 'Chhota Udaipur', 'Dahod', 'Dang', 'Devbhumi Dwarka',
        'Gandhinagar', 'Gir Somnath', 'Jamnagar', 'Junagadh', 'Kheda (Nadiad)',
        'Kutch (Bhuj)', 'Mahisagar', 'Mehsana', 'Morbi', 'Narmada (Rajpipla)',
        'Navsari', 'Panchmahal (Godhra)', 'Patan', 'Porbandar', 'Rajkot', 'Sabarkantha (Himmatnagar)',
        'Surat', 'Surendranagar', 'Tapi (Vyara)', 'Vadodara', 'Valsad'
      ]
    },
    {
      name: 'Haryana',
      districts: [
        'Ambala', 'Bhiwani', 'Charkhi Dadri', 'Faridabad', 'Fatehabad', 'Gurugram',
        'Hisar', 'Jhajjar (Bahadurgarh)', 'Jind', 'Kaithal', 'Karnal', 'Kurukshetra',
        'Mahendragarh (Narnaul)', 'Nuh (Mewat)', 'Palwal', 'Panchkula', 'Panipat',
        'Rewari', 'Rohtak', 'Sirsa', 'Sonipat', 'Yamunanagar'
      ]
    },
    {
      name: 'Himachal Pradesh',
      districts: [
        'Bilaspur', 'Chamba', 'Hamirpur', 'Kangra (Dharamshala)', 'Kinnaur',
        'Kullu (Manali)', 'Lahaul and Spiti', 'Mandi', 'Shimla', 'Sirmaur (Nahan)',
        'Solan (Baddi)', 'Una'
      ]
    },
    {
      name: 'Jammu & Kashmir',
      districts: [
        'Anantnag', 'Bandipora', 'Baramulla', 'Budgam', 'Doda', 'Ganderbal',
        'Jammu', 'Kathua', 'Kishtwar', 'Kulgam', 'Kupwara', 'Poonch',
        'Pulwama', 'Rajouri', 'Ramban', 'Reasi', 'Samba', 'Shopian',
        'Srinagar', 'Udhampur'
      ]
    },
    {
      name: 'Jharkhand',
      districts: [
        'Bokaro', 'Chatra', 'Deoghar', 'Dhanbad', 'Dumka', 'East Singhbhum (Jamshedpur)',
        'Garhwa', 'Giridih', 'Godda', 'Gumla', 'Hazaribagh', 'Jamtara', 'Khunti',
        'Koderma', 'Latehar', 'Lohardaga', 'Pakur', 'Palamu (Medininagar)',
        'Ramgarh', 'Ranchi', 'Sahibganj', 'Saraikela Kharsawan', 'Simdega', 'West Singhbhum (Chaibasa)'
      ]
    },
    {
      name: 'Karnataka',
      districts: [
        'Bagalkote', 'Ballari', 'Belagavi', 'Bengaluru Rural', 'Bengaluru Urban',
        'Bidar', 'Chamarajanagara', 'Chikkaballapura', 'Chikkamagaluru', 'Chitradurga',
        'Dakshina Kannada (Mangaluru)', 'Davanagere', 'Dharwad (Hubballi)', 'Gadag',
        'Hassan', 'Haveri', 'Kalaburagi', 'Kodagu (Madikeri)', 'Kolar', 'Koppal',
        'Mandya', 'Mysuru', 'Raichur', 'Ramanagara', 'Shivamogga', 'Tumakuru',
        'Udupi', 'Uttara Kannada (Karwar)', 'Vijayanagara', 'Vijayapura', 'Yadgir'
      ]
    },
    {
      name: 'Kerala',
      districts: [
        'Alappuzha', 'Ernakulam (Kochi)', 'Idukki', 'Kannur', 'Kasaragod',
        'Kollam', 'Kottayam', 'Kozhikode', 'Malappuram', 'Palakkad',
        'Pathanamthitta', 'Thiruvananthapuram', 'Thrissur', 'Wayanad'
      ]
    },
    {
      name: 'Ladakh',
      districts: ['Kargil', 'Leh']
    },
    {
      name: 'Lakshadweep',
      districts: ['Agatti', 'Amini', 'Andrott', 'Kavaratti', 'Minicoy']
    },
    {
      name: 'Madhya Pradesh',
      districts: [
        'Agar Malwa', 'Alirajpur', 'Anuppur', 'Ashoknagar', 'Balaghat', 'Barwani',
        'Betul', 'Bhind', 'Bhopal', 'Burhanpur', 'Chhatarpur', 'Chhindwara',
        'Damoh', 'Datia', 'Dewas', 'Dhar', 'Dindori', 'Guna', 'Gwalior',
        'Harda', 'Hoshangabad (Narmadapuram)', 'Indore', 'Jabalpur', 'Jhabua',
        'Katni', 'Khandwa', 'Khargone', 'Maihar', 'Mandla', 'Mandsaur',
        'Mauganj', 'Morena', 'Narsinghpur', 'Neemuch', 'Niwari', 'Panna',
        'Raisen', 'Rajgarh', 'Ratlam', 'Rewa', 'Sagar', 'Satna', 'Sehore',
        'Seoni', 'Shahdol', 'Shajapur', 'Sheopur', 'Shivpuri', 'Sidhi',
        'Singrauli', 'Tikamgarh', 'Ujjain', 'Umaria', 'Vidisha'
      ]
    },
    {
      name: 'Maharashtra',
      districts: [
        'Ahmednagar (Ahilyanagar)', 'Akola', 'Amravati', 'Beed', 'Bhandara',
        'Buldhana', 'Chandrapur', 'Chhatrapati Sambhajinagar (Aurangabad)', 'Dhule',
        'Gadchiroli', 'Gondia', 'Hingoli', 'Jalgaon', 'Jalna', 'Kolhapur',
        'Latur', 'Mumbai City', 'Mumbai Suburban', 'Nagpur', 'Nanded',
        'Nandurbar', 'Nashik', 'Navi Mumbai', 'Dharashiv (Osmanabad)', 'Palghar',
        'Parbhani', 'Pune', 'Raigad', 'Ratnagiri', 'Sangli', 'Satara',
        'Sindhudurg', 'Solapur', 'Thane', 'Wardha', 'Washim', 'Yavatmal'
      ]
    },
    {
      name: 'Manipur',
      districts: [
        'Bishnupur', 'Chandel', 'Churachandpur', 'Imphal East', 'Imphal West',
        'Jiribam', 'Kakching', 'Kamjong', 'Kangpokpi', 'Noney', 'Pherzawl',
        'Senapati', 'Tamenglong', 'Tengnoupal', 'Thoubal', 'Ukhrul'
      ]
    },
    {
      name: 'Meghalaya',
      districts: [
        'East Garo Hills', 'East Jaintia Hills', 'East Khasi Hills (Shillong)',
        'Eastern West Khasi Hills', 'North Garo Hills', 'Ri-Bhoi', 'South Garo Hills',
        'South West Garo Hills', 'South West Khasi Hills', 'West Garo Hills (Tura)',
        'West Jaintia Hills', 'West Khasi Hills'
      ]
    },
    {
      name: 'Mizoram',
      districts: [
        'Aizawl', 'Champhai', 'Hnahthial', 'Khawzawl', 'Kolasib',
        'Lawngtlai', 'Lunglei', 'Mamit', 'Saitual', 'Serchhip', 'Siaha'
      ]
    },
    {
      name: 'Nagaland',
      districts: [
        'Chümoukedima', 'Dimapur', 'Kiphire', 'Kohima', 'Longleng',
        'Mokokchung', 'Mon', 'Niuland', 'Noklak', 'Peren', 'Phek',
        'Shamator', 'Tseminyü', 'Tuensang', 'Wokha', 'Zünheboto'
      ]
    },
    {
      name: 'Odisha',
      districts: [
        'Angul', 'Balangir', 'Balasore', 'Bargarh', 'Bhadrak', 'Boudh',
        'Cuttack', 'Deogarh', 'Dhenkanal', 'Gajapati', 'Ganjam (Berhampur)',
        'Jagatsinghpur', 'Jajpur', 'Jharsuguda', 'Kalahandi', 'Kandhamal',
        'Kendrapara', 'Kendujhar (Keonjhar)', 'Khordha (Bhubaneswar)', 'Koraput',
        'Malkangiri', 'Mayurbhanj', 'Nabarangpur', 'Nayagarh', 'Nuapada',
        'Puri', 'Rayagada', 'Sambalpur', 'Subarnapur (Sonepur)', 'Sundargarh (Rourkela)'
      ]
    },
    {
      name: 'Puducherry',
      districts: ['Karaikal', 'Mahe', 'Puducherry', 'Yanam']
    },
    {
      name: 'Punjab',
      districts: [
        'Amritsar', 'Barnala', 'Bathinda', 'Faridkot', 'Fatehgarh Sahib',
        'Fazilka', 'Firozpur', 'Gurdaspur (Batala)', 'Hoshiarpur', 'Jalandhar',
        'Kapurthala', 'Ludhiana (Khanna)', 'Malerkotla', 'Mansa', 'Moga',
        'Mohali (SAS Nagar)', 'Muktsar', 'Pathankot', 'Patiala', 'Rupnagar',
        'Sangrur', 'Shahid Bhagat Singh Nagar (Nawanshahr)', 'Tarn Taran'
      ]
    },
    {
      name: 'Rajasthan',
      districts: [
        'Ajmer', 'Alwar', 'Anupgarh', 'Balotra', 'Banswara', 'Baran', 'Barmer',
        'Beawar', 'Bharatpur', 'Bhilwara', 'Bikaner', 'Bundi', 'Chittorgarh',
        'Churu', 'Dausa', 'Deeg', 'Didwana-Kuchaman', 'Dholpur', 'Dudu',
        'Gangapur City', 'Hanumangarh', 'Jaipur', 'Jaipur Rural', 'Jaisalmer',
        'Jalore', 'Jhalawar', 'Jhunjhunu', 'Jodhpur', 'Jodhpur Rural', 'Karauli',
        'Kekri', 'Khairthal-Tijara', 'Kota', 'Kotputli-Behror', 'Nagaur',
        'Neem Ka Thana', 'Pali', 'Phalodi', 'Pratapgarh', 'Rajsamand',
        'Salumbar', 'Sanchore', 'Sawai Madhopur', 'Shahpura', 'Sikar',
        'Sirohi', 'Sri Ganganagar', 'Tonk', 'Udaipur'
      ]
    },
    {
      name: 'Sikkim',
      districts: [
        'Gangtok (East Sikkim)', 'Gyalshing (West Sikkim)', 'Mangan (North Sikkim)',
        'Namchi (South Sikkim)', 'Pakyong', 'Soreng'
      ]
    },
    {
      name: 'Tamil Nadu',
      districts: [
        'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri',
        'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram', 'Kanyakumari', 'Karur',
        'Krishnagiri (Hosur)', 'Madurai', 'Mayiladuthurai', 'Nagapattinam', 'Namakkal',
        'Nilgiris (Ooty)', 'Perambalur', 'Pudukkottai', 'Ramanathapuram', 'Ranipet',
        'Salem', 'Sivaganga', 'Tenkasi', 'Thanjavur', 'Theni', 'Thoothukudi',
        'Tiruchirappalli', 'Tirunelveli', 'Tirupathur', 'Tiruppur', 'Tiruvallur',
        'Tiruvannamalai', 'Tiruvarur', 'Vellore', 'Viluppuram', 'Virudhunagar'
      ]
    },
    {
      name: 'Telangana',
      districts: [
        'Adilabad', 'Bhadradri Kothagudem', 'Hanamkonda', 'Hyderabad', 'Jagtial',
        'Jangaon', 'Jayashankar Bhupalpally', 'Jogulamba Gadwal', 'Kamareddy',
        'Karimnagar', 'Khammam', 'Kumuram Bheem Asifabad', 'Mahabubabad',
        'Mahbubnagar', 'Mancherial', 'Medak', 'Medchal-Malkajgiri', 'Mulugu',
        'Nagarkurnool', 'Nalgonda', 'Narayanpet', 'Nirmal', 'Nizamabad',
        'Peddapalli (Ramagundam)', 'Rajanna Sircilla', 'Rangareddy', 'Sangareddy',
        'Siddipet', 'Suryapet', 'Vikarabad', 'Wanaparthy', 'Warangal', 'Yadadri Bhuvanagiri'
      ]
    },
    {
      name: 'Tripura',
      districts: [
        'Dhalai', 'Gomati', 'Khowai', 'North Tripura', 'Sepahijala',
        'South Tripura', 'Unakoti', 'West Tripura (Agartala)'
      ]
    },
    {
      // ALL 75 DISTRICTS OF UTTAR PRADESH (Alphabetically ordered)
      name: 'Uttar Pradesh',
      districts: [
        'Agra',
        'Aligarh',
        'Ambedkar Nagar',
        'Amethi',
        'Amroha (Jyotiba Phule Nagar)',
        'Auraiya',
        'Ayodhya (Faizabad)',
        'Azamgarh',
        'Baghpat',
        'Bahraich',
        'Ballia',
        'Balrampur',
        'Banda',
        'Barabanki',
        'Bareilly',
        'Basti',
        'Bhadohi (Sant Ravidas Nagar)',
        'Bijnor',
        'Budaun',
        'Bulandshahr',
        'Chandauli',
        'Chitrakoot',
        'Deoria',
        'Etah',
        'Etawah',
        'Farrukhabad',
        'Fatehpur',
        'Firozabad',
        'Gautam Buddha Nagar (Noida)',
        'Ghaziabad',
        'Ghazipur',
        'Gonda',
        'Gorakhpur',
        'Hamirpur',
        'Hapur (Panchsheel Nagar)',
        'Hardoi',
        'Hathras (Mahamaya Nagar)',
        'Jalaun (Orai)',
        'Jaunpur',
        'Jhansi',
        'Kannauj',
        'Kanpur Dehat',
        'Kanpur Nagar',
        'Kasganj (Kanshiram Nagar)',
        'Kaushambi',
        'Kushinagar (Padrauna)',
        'Lakhimpur Kheri',
        'Lalitpur',
        'Lucknow',
        'Maharajganj',
        'Mahoba',
        'Mainpuri',
        'Mathura',
        'Mau',
        'Meerut',
        'Mirzapur',
        'Moradabad',
        'Muzaffarnagar',
        'Pilibhit',
        'Pratapgarh',
        'Prayagraj (Allahabad)',
        'Raebareli',
        'Rampur',
        'Saharanpur',
        'Sambhal (Bhim Nagar)',
        'Sant Kabir Nagar',
        'Shahjahanpur',
        'Shamli (Prabuddh Nagar)',
        'Shravasti',
        'Siddharthnagar',
        'Sitapur',
        'Sonbhadra',
        'Sultanpur',
        'Unnao',
        'Varanasi'
      ]
    },
    {
      name: 'Uttarakhand',
      districts: [
        'Almora', 'Bageshwar', 'Chamoli', 'Champawat', 'Dehradun',
        'Haridwar (Roorkee)', 'Nainital (Haldwani)', 'Pauri Garhwal',
        'Pithoragarh', 'Rudraprayag', 'Tehri Garhwal', 'Udham Singh Nagar (Rudrapur, Kashipur)',
        'Uttarkashi'
      ]
    },
    {
      name: 'West Bengal',
      districts: [
        'Alipurduar', 'Bankura', 'Birbhum', 'Cooch Behar', 'Dakshin Dinajpur',
        'Darjeeling (Siliguri)', 'Hooghly', 'Howrah', 'Jalpaiguri', 'Jhargram',
        'Kalimpong', 'Kolkata', 'Malda', 'Murshidabad', 'Nadia',
        'North 24 Parganas', 'Paschim Bardhaman (Asansol, Durgapur)', 'Paschim Medinipur',
        'Purba Bardhaman', 'Purba Medinipur', 'Purulia', 'South 24 Parganas', 'Uttar Dinajpur'
      ]
    }
  ],

  // UNITED ARAB EMIRATES - All 7 Emirates
  'United Arab Emirates': [
    {
      name: 'Dubai',
      districts: [
        'Deira', 'Bur Dubai', 'Downtown Dubai', 'Dubai Marina', 'Business Bay',
        'Jumeirah', 'Al Barsha', 'International City', 'Al Quoz', 'Palm Jumeirah',
        'Mirdif', 'Al Nahda', 'Al Karama', 'JLT (Jumeirah Lakes Towers)', 'Silicon Oasis'
      ]
    },
    {
      name: 'Abu Dhabi',
      districts: [
        'Abu Dhabi City', 'Al Ain', 'Al Dhafra', 'Mussafah', 'Khalifa City',
        'Yas Island', 'Al Reem Island', 'Corniche', 'Saadiyat Island', 'Mohammed Bin Zayed City'
      ]
    },
    {
      name: 'Sharjah',
      districts: [
        'Al Majaz', 'Al Nahda (Sharjah)', 'Al Taawun', 'Muwailih', 'Rolla',
        'Al Qasimia', 'Al Khan', 'Khor Fakkan', 'Kalba', 'Al Dhaid'
      ]
    },
    {
      name: 'Ajman',
      districts: ['Ajman City', 'Al Nuaimiya', 'Al Rashidiya', 'Al Jurf', 'Al Rawda', 'Masfout']
    },
    {
      name: 'Ras Al Khaimah',
      districts: ['RAK City', 'Al Nakheel', 'Al Hamra Village', 'Mina Al Arab', 'Al Dhait']
    },
    {
      name: 'Fujairah',
      districts: ['Fujairah City', 'Dibba Al Fujairah', 'Al Faseel', 'Mirbah']
    },
    {
      name: 'Umm Al Quwain',
      districts: ['UAQ City', 'Al Salamah', 'Falaj Al Mualla']
    }
  ],

  // SAUDI ARABIA - Major Provinces
  'Saudi Arabia': [
    {
      name: 'Riyadh Region',
      districts: ['Riyadh City', 'Al Kharj', 'Ad Diriyah', 'Al Majma\'ah', 'Al Dawadmi', 'Wadi Ad Dawasir', 'Afif']
    },
    {
      name: 'Makkah Region',
      districts: ['Jeddah', 'Makkah Al Mukarramah', 'Taif', 'Rabigh', 'Al Qunfudhah', 'Al Lith', 'Khulais']
    },
    {
      name: 'Eastern Province',
      districts: ['Dammam', 'Al Khobar', 'Dhahran', 'Jubail Industrial City', 'Al Ahsa (Hofuf)', 'Qatif', 'Hafar Al Batin', 'Ras Tanura']
    },
    {
      name: 'Madinah Region',
      districts: ['Madinah Al Munawwarah', 'Yanbu Al Bahr', 'Badr', 'Al Ula', 'Mahd Adh Dhahab']
    },
    {
      name: 'Asir Region',
      districts: ['Abha', 'Khamis Mushait', 'Bisha', 'Mahayil Asir']
    },
    {
      name: 'Al Qassim',
      districts: ['Buraidah', 'Unaizah', 'Ar Rass', 'Al Bukayriyah']
    },
    {
      name: 'Tabuk Region',
      districts: ['Tabuk City', 'Duba', 'NEOM Area', 'Al Wajh']
    },
    {
      name: 'Jazan Region',
      districts: ['Jazan City', 'Sabya', 'Abu Arish', 'Samtah']
    }
  ],

  // UNITED STATES - Major States
  'United States': [
    {
      name: 'California',
      districts: ['Los Angeles', 'San Francisco', 'San Diego', 'San Jose', 'Orange County', 'Sacramento', 'Oakland', 'Fresno', 'Bakersfield', 'Long Beach']
    },
    {
      name: 'Texas',
      districts: ['Houston', 'Dallas', 'Austin', 'San Antonio', 'Fort Worth', 'El Paso', 'Arlington', 'Plano', 'Irving', 'Frisco']
    },
    {
      name: 'New York',
      districts: ['New York City (Manhattan)', 'Brooklyn', 'Queens', 'The Bronx', 'Staten Island', 'Buffalo', 'Rochester', 'Albany', 'Syracuse', 'Long Island']
    },
    {
      name: 'New Jersey',
      districts: ['Jersey City', 'Newark', 'Edison', 'Princeton', 'Paterson', 'Hoboken', 'Trenton', 'New Brunswick']
    },
    {
      name: 'Illinois',
      districts: ['Chicago', 'Aurora', 'Naperville', 'Joliet', 'Rockford', 'Springfield', 'Evanston']
    },
    {
      name: 'Florida',
      districts: ['Miami', 'Orlando', 'Tampa', 'Jacksonville', 'Fort Lauderdale', 'St. Petersburg', 'Tallahassee']
    },
    {
      name: 'Washington',
      districts: ['Seattle', 'Bellevue', 'Redmond', 'Tacoma', 'Spokane', 'Kirkland', 'Olympia']
    },
    {
      name: 'Virginia',
      districts: ['Arlington', 'Alexandria', 'Fairfax', 'Richmond', 'Virginia Beach', 'Norfolk', 'Loudoun']
    },
    {
      name: 'Georgia',
      districts: ['Atlanta', 'Savannah', 'Augusta', 'Columbus', 'Alpharetta', 'Marietta']
    },
    {
      name: 'Massachusetts',
      districts: ['Boston', 'Cambridge', 'Worcester', 'Springfield', 'Lowell']
    },
    {
      name: 'Pennsylvania',
      districts: ['Philadelphia', 'Pittsburgh', 'Allentown', 'Erie', 'Harrisburg']
    },
    {
      name: 'Ohio',
      districts: ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron', 'Dayton']
    },
    {
      name: 'Michigan',
      districts: ['Detroit', 'Grand Rapids', 'Ann Arbor', 'Lansing', 'Troy']
    }
  ],

  // UNITED KINGDOM
  'United Kingdom': [
    {
      name: 'England (Greater London)',
      districts: ['City of London', 'Westminster', 'Camden', 'Greenwich', 'Hackney', 'Islington', 'Kensington and Chelsea', 'Lambeth', 'Southwark', 'Tower Hamlets', 'Croydon', 'Ealing', 'Hounslow', 'Newham', 'Wembley (Brent)']
    },
    {
      name: 'England (West Midlands)',
      districts: ['Birmingham', 'Coventry', 'Wolverhampton', 'Solihull', 'Walsall', 'Dudley']
    },
    {
      name: 'England (Greater Manchester)',
      districts: ['Manchester City', 'Salford', 'Bolton', 'Oldham', 'Rochdale', 'Stockport', 'Trafford', 'Wigan']
    },
    {
      name: 'England (Yorkshire)',
      districts: ['Leeds', 'Sheffield', 'Bradford', 'York', 'Hull', 'Huddersfield']
    },
    {
      name: 'England (Other Regions)',
      districts: ['Liverpool', 'Bristol', 'Newcastle upon Tyne', 'Nottingham', 'Leicester', 'Southampton', 'Oxford', 'Cambridge', 'Reading', 'Milton Keynes', 'Luton', 'Brighton']
    },
    {
      name: 'Scotland',
      districts: ['Edinburgh', 'Glasgow', 'Aberdeen', 'Dundee', 'Inverness', 'Stirling', 'Paisley']
    },
    {
      name: 'Wales',
      districts: ['Cardiff', 'Swansea', 'Newport', 'Wrexham', 'Barry']
    },
    {
      name: 'Northern Ireland',
      districts: ['Belfast', 'Derry / Londonderry', 'Lisburn', 'Newry', 'Bangor']
    }
  ],

  // CANADA
  Canada: [
    {
      name: 'Ontario',
      districts: ['Toronto', 'Mississauga', 'Brampton', 'Ottawa', 'Hamilton', 'Markham', 'London', 'Vaughan', 'Kitchener', 'Windsor', 'Oakville', 'Burlington']
    },
    {
      name: 'British Columbia',
      districts: ['Vancouver', 'Surrey', 'Burnaby', 'Richmond', 'Victoria', 'Abbotsford', 'Kelowna', 'Coquitlam', 'Langley']
    },
    {
      name: 'Alberta',
      districts: ['Calgary', 'Edmonton', 'Red Deer', 'Lethbridge', 'Fort McMurray', 'Medicine Hat']
    },
    {
      name: 'Quebec',
      districts: ['Montreal', 'Quebec City', 'Laval', 'Gatineau', 'Longueuil', 'Sherbrooke']
    },
    {
      name: 'Manitoba',
      districts: ['Winnipeg', 'Brandon', 'Steinbach']
    },
    {
      name: 'Nova Scotia',
      districts: ['Halifax', 'Dartmouth', 'Sydney']
    },
    {
      name: 'Saskatchewan',
      districts: ['Saskatoon', 'Regina', 'Prince Albert']
    }
  ],

  // AUSTRALIA
  Australia: [
    {
      name: 'New South Wales',
      districts: ['Sydney (CBD)', 'Parramatta', 'Blacktown', 'Liverpool', 'Newcastle', 'Central Coast', 'Wollongong', 'Penrith']
    },
    {
      name: 'Victoria',
      districts: ['Melbourne (CBD)', 'Geelong', 'Ballarat', 'Bendigo', 'Dandenong', 'Frankston', 'Werribee']
    },
    {
      name: 'Queensland',
      districts: ['Brisbane', 'Gold Coast', 'Sunshine Coast', 'Townsville', 'Cairns', 'Toowoomba', 'Ipswich']
    },
    {
      name: 'Western Australia',
      districts: ['Perth', 'Fremantle', 'Mandurah', 'Bunbury', 'Joondalup']
    },
    {
      name: 'South Australia',
      districts: ['Adelaide', 'Mount Gambier', 'Whyalla', 'Gawler']
    },
    {
      name: 'Australian Capital Territory',
      districts: ['Canberra', 'Belconnen', 'Tuggeranong', 'Gungahlin']
    }
  ],

  // QATAR
  Qatar: [
    {
      name: 'Doha Municipality',
      districts: ['Doha City', 'West Bay', 'The Pearl', 'Al Sadd', 'Old Airport', 'Al Dafna', 'Al Mansoura', 'Al Najma']
    },
    {
      name: 'Al Rayyan Municipality',
      districts: ['Al Rayyan City', 'Education City', 'Al Gharafa', 'Abu Hamour', 'Muaither', 'Al Waab', 'Al Sailiya']
    },
    {
      name: 'Al Wakrah Municipality',
      districts: ['Al Wakrah City', 'Mesaieed', 'Al Wukair', 'Ezdan Oasis']
    },
    {
      name: 'Al Khor Municipality',
      districts: ['Al Khor City', 'Ras Laffan', 'Al Thakhira']
    },
    {
      name: 'Umm Salal & Al Daayen',
      districts: ['Umm Salal Muhammed', 'Lusail City', 'Umm Salal Ali', 'Al Kheesa']
    }
  ],

  // KUWAIT
  Kuwait: [
    {
      name: 'Al Asimah (Capital)',
      districts: ['Kuwait City', 'Sharq', 'Dasman', 'Mirgab', 'Salhiya', 'Qibla', 'Shuwaikh', 'Bneid Al-Qar']
    },
    {
      name: 'Hawalli Governorate',
      districts: ['Hawalli', 'Salmiya', 'Rumaithiya', 'Jabriya', 'Bayan', 'Mishref', 'Shaab']
    },
    {
      name: 'Farwaniya Governorate',
      districts: ['Farwaniya', 'Khaitan', 'Jleeb Al-Shuyoukh', 'Al-Rai', 'Andalous', 'Rabiya', 'Sabah Al-Nasser']
    },
    {
      name: 'Al Ahmadi Governorate',
      districts: ['Ahmadi', 'Fahaheel', 'Mangaf', 'Mahboula', 'Abu Halifa', 'Egaila', 'Sabah Al-Ahmad']
    },
    {
      name: 'Mubarak Al-Kabeer',
      districts: ['Sabah Al-Salem', 'Al-Qurain', 'Al-Adan', 'Al-Qusour', 'Mubarak Al-Kabeer City']
    },
    {
      name: 'Al Jahra Governorate',
      districts: ['Al Jahra City', 'Saad Al Abdullah', 'Sulaibiya', 'Qasr', 'Waha']
    }
  ],

  // OMAN
  Oman: [
    {
      name: 'Muscat Governorate',
      districts: ['Muscat City', 'Ruwi', 'Mutrah', 'Bawshar', 'Al Seeb', 'Al Khuwair', 'Al Ghubrah', 'Qurum', 'Al Amerat']
    },
    {
      name: 'Dhofar Governorate',
      districts: ['Salalah', 'Taqah', 'Mirbat', 'Thumrait']
    },
    {
      name: 'Al Batinah North',
      districts: ['Sohar', 'Saham', 'Shinas', 'Liwa', 'Al Khaburah']
    },
    {
      name: 'Al Dakhiliyah',
      districts: ['Nizwa', 'Bahla', 'Samail', 'Izki']
    },
    {
      name: 'Al Batinah South',
      districts: ['Barka', 'Rustaq', 'Al Musanaah']
    }
  ],

  // BAHRAIN
  Bahrain: [
    {
      name: 'Capital Governorate',
      districts: ['Manama', 'Juffair', 'Seef', 'Gudaibiya', 'Hoora', 'Adliya', 'Zinj', 'Umm Al Hassam']
    },
    {
      name: 'Muharraq Governorate',
      districts: ['Muharraq City', 'Busaiteen', 'Hidd', 'Amwaj Islands', 'Diyar Al Muharraq']
    },
    {
      name: 'Northern Governorate',
      districts: ['Budaiya', 'Saar', 'Hamad Town', 'Janabiyah', 'Barbar', 'A\'ali']
    },
    {
      name: 'Southern Governorate',
      districts: ['Riffa', 'Isa Town', 'Zallaq', 'Awali', 'Sakhir']
    }
  ],

  // PAKISTAN
  Pakistan: [
    {
      name: 'Punjab',
      districts: ['Lahore', 'Rawalpindi', 'Faisalabad', 'Multan', 'Gujranwala', 'Sialkot', 'Sargodha', 'Bahawalpur', 'Sheikhupura', 'Jhelum', 'Gujrat', 'Sahiwal']
    },
    {
      name: 'Sindh',
      districts: ['Karachi Central', 'Karachi South', 'Karachi East', 'Clifton / DHA', 'Hyderabad', 'Sukkur', 'Larkana', 'Mirpur Khas', 'Nawabshah']
    },
    {
      name: 'Islamabad Capital Territory',
      districts: ['Islamabad (Sectors F, G, H, I)', 'Rawal Town', 'DHA Islamabad', 'Bahria Town']
    },
    {
      name: 'Khyber Pakhtunkhwa',
      districts: ['Peshawar', 'Abbottabad', 'Mardan', 'Swat (Mingora)', 'Kohat', 'Nowshera', 'Dera Ismail Khan']
    },
    {
      name: 'Balochistan',
      districts: ['Quetta', 'Gwadar', 'Turbat', 'Khuzdar', 'Hub']
    }
  ],

  // BANGLADESH
  Bangladesh: [
    {
      name: 'Dhaka Division',
      districts: ['Dhaka City', 'Gazipur', 'Narayanganj', 'Tangail', 'Faridpur', 'Manikganj', 'Munshiganj', 'Narsingdi']
    },
    {
      name: 'Chittagong Division',
      districts: ['Chittagong City', 'Cox\'s Bazar', 'Comilla', 'Noakhali', 'Feni', 'Brahmanbaria', 'Chandpur']
    },
    {
      name: 'Sylhet Division',
      districts: ['Sylhet City', 'Moulvibazar', 'Habiganj', 'Sunamganj']
    },
    {
      name: 'Rajshahi Division',
      districts: ['Rajshahi City', 'Bogra', 'Pabna', 'Sirajganj', 'Naogaon']
    },
    {
      name: 'Khulna Division',
      districts: ['Khulna City', 'Jessore', 'Kushtia', 'Satkhira']
    }
  ],

  // NEPAL
  Nepal: [
    {
      name: 'Bagmati Province',
      districts: ['Kathmandu', 'Lalitpur (Patan)', 'Bhaktapur', 'Chitwan (Bharatpur)', 'Hetauda (Makwanpur)', 'Kavrepalanchok']
    },
    {
      name: 'Gandaki Province',
      districts: ['Pokhara (Kaski)', 'Gorkha', 'Tanahun', 'Syangja']
    },
    {
      name: 'Koshi Province',
      districts: ['Biratnagar (Morang)', 'Dharan (Sunsari)', 'Damak (Jhapa)']
    },
    {
      name: 'Madhesh Province',
      districts: ['Janakpur (Dhanusha)', 'Birgunj (Parsa)', 'Siraha']
    },
    {
      name: 'Lumbini Province',
      districts: ['Butwal (Rupandehi)', 'Bhairahawa', 'Nepalgunj (Banke)', 'Dang']
    }
  ],

  // SINGAPORE
  Singapore: [
    {
      name: 'Central Region',
      districts: ['Downtown Core', 'Orchard', 'Marina Bay', 'Tanjong Pagar', 'Bukit Merah', 'Queenstown', 'Novena']
    },
    {
      name: 'East Region',
      districts: ['Tampines', 'Bedok', 'Pasir Ris', 'Changi']
    },
    {
      name: 'West Region',
      districts: ['Jurong East', 'Jurong West', 'Clementi', 'Bukit Batok', 'Choa Chu Kang']
    },
    {
      name: 'North-East Region',
      districts: ['Sengkang', 'Punggol', 'Hougang', 'Ang Mo Kio', 'Serangoon']
    },
    {
      name: 'North Region',
      districts: ['Woodlands', 'Yishun', 'Sembawang']
    }
  ],

  // MALAYSIA
  Malaysia: [
    {
      name: 'Federal Territory of Kuala Lumpur',
      districts: ['Bukit Bintang', 'KLCC / City Centre', 'Bangsar', 'Mont Kiara', 'Cheras', 'Setapak']
    },
    {
      name: 'Selangor',
      districts: ['Petaling Jaya', 'Shah Alam', 'Subang Jaya', 'Klang', 'Cyberjaya', 'Puchong', 'Ampang']
    },
    {
      name: 'Penang',
      districts: ['George Town', 'Bayan Lepas', 'Butterworth', 'Bukit Mertajam']
    },
    {
      name: 'Johor',
      districts: ['Johor Bahru', 'Iskandar Puteri', 'Batu Pahat', 'Muar', 'Kluang']
    }
  ],

  // GERMANY
  Germany: [
    {
      name: 'Berlin',
      districts: ['Mitte', 'Charlottenburg-Wilmersdorf', 'Friedrichshain-Kreuzberg', 'Pankow', 'Tempelhof-Schöneberg']
    },
    {
      name: 'Bavaria (Bayern)',
      districts: ['Munich (München)', 'Nuremberg (Nürnberg)', 'Augsburg', 'Regensburg', 'Ingolstadt', 'Würzburg']
    },
    {
      name: 'North Rhine-Westphalia (NRW)',
      districts: ['Cologne (Köln)', 'Düsseldorf', 'Dortmund', 'Essen', 'Bonn', 'Münster', 'Aachen', 'Bielefeld']
    },
    {
      name: 'Baden-Württemberg',
      districts: ['Stuttgart', 'Karlsruhe', 'Mannheim', 'Freiburg', 'Heidelberg', 'Ulm', 'Heilbronn']
    },
    {
      name: 'Hesse (Hessen)',
      districts: ['Frankfurt am Main', 'Wiesbaden', 'Kassel', 'Darmstadt', 'Offenbach']
    },
    {
      name: 'Hamburg',
      districts: ['Hamburg-Mitte', 'Altona', 'Eimsbüttel', 'Hamburg-Nord', 'Wandsbek']
    }
  ]
};

// Helper: Get label and placeholder for Postal Code based on Country
export function getPostalCodeConfig(countryName: string): { label: string; placeholder: string } {
  if (countryName === 'India') {
    return { label: 'PIN Code', placeholder: 'e.g. 244221 or 110001 (6 digits)' };
  }
  if (countryName === 'United States') {
    return { label: 'ZIP Code', placeholder: 'e.g. 90210 or 10001 (5 digits)' };
  }
  if (countryName === 'United Kingdom') {
    return { label: 'Postal Code', placeholder: 'e.g. SW1A 1AA or W1D 3QU' };
  }
  if (countryName === 'Canada') {
    return { label: 'Postal Code', placeholder: 'e.g. M5V 2T6' };
  }
  if (countryName === 'United Arab Emirates') {
    return { label: 'PO Box / Postal Area', placeholder: 'e.g. 12345 or Dubai Main' };
  }
  return { label: 'PIN / ZIP / Postal Code', placeholder: 'e.g. 244221 or local postal code' };
}

// Helper: Get available states for a given country in alphabetical order
export function getStatesForCountry(countryName: string): StateData[] {
  const states = COUNTRY_STATE_DISTRICT_MAP[countryName] || [];
  return [...states].sort((a, b) => a.name.localeCompare(b.name));
}

// Helper: Get available districts for a given country and state in alphabetical order
export function getDistrictsForState(countryName: string, stateName: string): string[] {
  const states = COUNTRY_STATE_DISTRICT_MAP[countryName];
  if (!states) return [];
  const matched = states.find(
    (s) => s.name.toLowerCase().trim() === stateName.toLowerCase().trim()
  );
  if (!matched) return [];
  return [...matched.districts].sort((a, b) => a.localeCompare(b));
}
