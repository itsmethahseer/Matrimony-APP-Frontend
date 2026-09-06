import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@offline_matrimony_db_v1';
const CURRENT_USER_KEY = '@offline_current_user_id';

// Initial dataset directly cloned from seed.py
const INITIAL_USERS = [
  {
    id: 1,
    email: 'admin@matrimony.com',
    password: 'admin123',
    is_admin: true,
    membership_status: 'Premium',
    plan_type: 'Platinum',
    remaining_contact_views: 9999,
    remaining_messages: 9999,
    remaining_call_time: 1000,
    credits: 9999,
    plan_validity: new Date(Date.now() + 180 * 86400000).toISOString(),
    id_verification_status: 'Verified',
    id_verification_document_url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    last_active_at: new Date().toISOString(),
  },
  {
    id: 2,
    email: 'ahmed@example.com',
    password: 'password123',
    is_admin: false,
    membership_status: 'Free',
    plan_type: null,
    remaining_contact_views: 0,
    remaining_messages: 50,
    remaining_call_time: 0,
    credits: 25,
    plan_validity: null,
    id_verification_status: 'Verified',
    id_verification_document_url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    last_active_at: new Date().toISOString(),
  },
  {
    id: 3,
    email: 'fatima@example.com',
    password: 'password123',
    is_admin: false,
    membership_status: 'Premium',
    plan_type: 'Gold',
    remaining_contact_views: 100,
    remaining_messages: 1000,
    remaining_call_time: 300,
    credits: 500,
    plan_validity: new Date(Date.now() + 90 * 86400000).toISOString(),
    id_verification_status: 'Verified',
    id_verification_document_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    last_active_at: new Date().toISOString(),
  },
  {
    id: 4,
    email: 'aisha@example.com',
    password: 'password123',
    is_admin: false,
    membership_status: 'Free',
    plan_type: null,
    remaining_contact_views: 0,
    remaining_messages: 50,
    remaining_call_time: 0,
    credits: 25,
    plan_validity: null,
    id_verification_status: 'Unverified',
    id_verification_document_url: null,
    last_active_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 5,
    email: 'zainab@example.com',
    password: 'password123',
    is_admin: false,
    membership_status: 'Premium',
    plan_type: 'Silver',
    remaining_contact_views: 20,
    remaining_messages: 200,
    remaining_call_time: 60,
    credits: 100,
    plan_validity: new Date(Date.now() + 30 * 86400000).toISOString(),
    id_verification_status: 'Unverified',
    id_verification_document_url: null,
    last_active_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 6,
    email: 'yasmin@example.com',
    password: 'password123',
    is_admin: false,
    membership_status: 'Free',
    plan_type: null,
    remaining_contact_views: 0,
    remaining_messages: 50,
    remaining_call_time: 0,
    credits: 25,
    plan_validity: null,
    id_verification_status: 'Unverified',
    id_verification_document_url: null,
    last_active_at: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: 7,
    email: 'mariam@example.com',
    password: 'password123',
    is_admin: false,
    membership_status: 'Free',
    plan_type: null,
    remaining_contact_views: 0,
    remaining_messages: 50,
    remaining_call_time: 0,
    credits: 25,
    plan_validity: null,
    id_verification_status: 'Pending',
    id_verification_document_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    last_active_at: new Date(Date.now() - 18000000).toISOString(),
  },
  {
    id: 8,
    email: 'bilal@example.com',
    password: 'password123',
    is_admin: false,
    membership_status: 'Free',
    plan_type: null,
    remaining_contact_views: 0,
    remaining_messages: 50,
    remaining_call_time: 0,
    credits: 25,
    plan_validity: null,
    id_verification_status: 'Pending',
    id_verification_document_url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    last_active_at: new Date(Date.now() - 21600000).toISOString(),
  },
  {
    id: 9,
    email: 'yousef@example.com',
    password: 'password123',
    is_admin: false,
    membership_status: 'Premium',
    plan_type: 'Platinum',
    remaining_contact_views: 9999,
    remaining_messages: 9999,
    remaining_call_time: 1000,
    credits: 9999,
    plan_validity: new Date(Date.now() + 180 * 86400000).toISOString(),
    id_verification_status: 'Verified',
    id_verification_document_url: null,
    last_active_at: new Date().toISOString(),
  },
  {
    id: 10,
    email: 'interest_tester_male@example.com',
    password: 'password123',
    is_admin: false,
    membership_status: 'Free',
    plan_type: null,
    remaining_contact_views: 0,
    remaining_messages: 50,
    remaining_call_time: 0,
    credits: 25,
    plan_validity: null,
    id_verification_status: 'Unverified',
    id_verification_document_url: null,
    last_active_at: new Date().toISOString(),
  },
  {
    id: 11,
    email: 'interest_tester_female@example.com',
    password: 'password123',
    is_admin: false,
    membership_status: 'Free',
    plan_type: null,
    remaining_contact_views: 0,
    remaining_messages: 50,
    remaining_call_time: 0,
    credits: 25,
    plan_validity: null,
    id_verification_status: 'Unverified',
    id_verification_document_url: null,
    last_active_at: new Date().toISOString(),
  },
];

const INITIAL_PROFILES = [
  {
    id: 1,
    user_id: 1,
    name: 'Admin Supervisor',
    age: 32,
    gender: 'Male',
    marital_status: 'Never Married',
    language: 'English',
    religion: 'Islam',
    sect: 'Sunni',
    present_location: 'Mumbai',
    present_country: 'India',
    present_state: 'Maharashtra',
    partner_country_pref: ['India'],
    partner_state_pref: ['All'],
    profession: 'Platform Admin & Supervisor',
    annual_income: 2500000.0,
    height: 180.0,
    weight: 75.0,
    differently_abled: false,
    orphan_poor_girl: false,
    education: 'M.Tech Computer Science',
    health_or_disabilities: null,
    tagline: 'System Administrator and Moderator for HelpMeet.',
    profile_description: 'Admin account managing approvals, verifications, and user support.',
    about: 'Dedicated to keeping the matrimonial community safe, verified, and transparent.',
    primary_no: '+91-9876543210',
    whatsapp_no: '+91-9876543210',
    preferred_contact_method: 'WhatsApp',
    best_time_to_call: '10 AM to 6 PM',
    contact_person: 'Admin Helpdesk',
    full_address: 'HelpMeet HQ, Bandra West, Mumbai',
    family_type: 'Nuclear',
    financial_status: 'Upper Middle Class',
    interests: ['Technology', 'Community', 'Moderation'],
    partner_age_min: 24,
    partner_age_max: 32,
    partner_height_min: 155.0,
    partner_height_max: 180.0,
  },
  {
    id: 2,
    user_id: 2,
    name: 'Ahmed Khan',
    age: 28,
    gender: 'Male',
    marital_status: 'Never Married',
    language: 'Urdu',
    religion: 'Islam',
    sect: 'Sunni',
    present_location: 'Mumbai',
    present_country: 'India',
    present_state: 'Maharashtra',
    partner_country_pref: ['India'],
    partner_state_pref: ['All'],
    profession: 'Software Engineer',
    annual_income: 1200000.0,
    height: 178.0,
    weight: 74.0,
    differently_abled: false,
    orphan_poor_girl: false,
    education: 'B.Tech Computer Science',
    health_or_disabilities: null,
    tagline: 'Looking for a pious partner who values family.',
    profile_description: 'A well-settled individual seeking a meaningful marriage connection built on respect and shared values.',
    about: 'I am simple, religious, and open-minded. I enjoy traveling and reading books.',
    primary_no: '+91-9876543210',
    whatsapp_no: '+91-9876543210',
    preferred_contact_method: 'WhatsApp',
    best_time_to_call: 'Evenings 6 PM to 9 PM',
    contact_person: 'Self / Parent',
    full_address: 'Flat 101, Residency Towers, Mumbai',
    family_type: 'Nuclear',
    financial_status: 'Upper Middle Class',
    interests: ['Reading', 'Cooking', 'Travel', 'Coding'],
    partner_age_min: 21,
    partner_age_max: 27,
    partner_height_min: 155.0,
    partner_height_max: 170.0,
  },
  {
    id: 3,
    user_id: 3,
    name: 'Fatima Bi',
    age: 25,
    gender: 'Female',
    marital_status: 'Never Married',
    language: 'Hindi',
    religion: 'Islam',
    sect: 'Sunni',
    present_location: 'Delhi',
    present_country: 'India',
    present_state: 'Delhi',
    partner_country_pref: ['India'],
    partner_state_pref: ['All'],
    profession: 'Doctor',
    annual_income: 1500000.0,
    height: 162.0,
    weight: 56.0,
    differently_abled: false,
    orphan_poor_girl: false,
    education: 'MBBS, MD',
    health_or_disabilities: null,
    tagline: 'Passionate doctor seeking an understanding and respectful companion.',
    profile_description: 'Caring doctor who balances career aspirations with strong family traditions.',
    about: 'I value honesty, empathy, and intellectual conversations. Looking for a partner who is supportive and family-oriented.',
    primary_no: '+91-9876543211',
    whatsapp_no: '+91-9876543211',
    preferred_contact_method: 'WhatsApp',
    best_time_to_call: '7 PM to 9 PM',
    contact_person: 'Father',
    full_address: 'Green Park Extension, New Delhi',
    family_type: 'Nuclear',
    financial_status: 'Upper Middle Class',
    interests: ['Healthcare', 'Reading', 'Music'],
    partner_age_min: 25,
    partner_age_max: 32,
    partner_height_min: 170.0,
    partner_height_max: 185.0,
  },
  {
    id: 4,
    user_id: 4,
    name: 'Aisha Rahman',
    age: 24,
    gender: 'Female',
    marital_status: 'Never Married',
    language: 'Bengali',
    religion: 'Islam',
    sect: 'Sunni',
    present_location: 'Kolkata',
    present_country: 'India',
    present_state: 'West Bengal',
    partner_country_pref: ['India'],
    partner_state_pref: ['All'],
    profession: 'Graphic Designer',
    annual_income: 500000.0,
    height: 158.0,
    weight: 52.0,
    differently_abled: false,
    orphan_poor_girl: true, // Orphan category
    education: 'B.Sc Design',
    health_or_disabilities: null,
    tagline: 'Creative soul with humble beginnings looking for true love.',
    profile_description: 'An orphan raised with strong moral grounding and a creative eye for design.',
    about: 'I work as a UI/UX and graphic designer. I love art, nature, and creating warm homes.',
    primary_no: '+91-9876543212',
    whatsapp_no: '+91-9876543212',
    preferred_contact_method: 'WhatsApp',
    best_time_to_call: '5 PM to 8 PM',
    contact_person: 'Guardian / Self',
    full_address: 'Salt Lake Sector 1, Kolkata',
    family_type: 'Other',
    financial_status: 'Middle Class',
    interests: ['Art', 'Design', 'Photography'],
    partner_age_min: 25,
    partner_age_max: 30,
    partner_height_min: 165.0,
    partner_height_max: 180.0,
  },
  {
    id: 5,
    user_id: 5,
    name: 'Zainab Sheikh',
    age: 26,
    gender: 'Female',
    marital_status: 'Never Married',
    language: 'English',
    religion: 'Islam',
    sect: 'Shia',
    present_location: 'Mumbai',
    present_country: 'India',
    present_state: 'Maharashtra',
    partner_country_pref: ['India'],
    partner_state_pref: ['All'],
    profession: 'Financial Analyst',
    annual_income: 900000.0,
    height: 165.0,
    weight: 58.0,
    differently_abled: false,
    orphan_poor_girl: false,
    education: 'MBA Finance',
    health_or_disabilities: null,
    tagline: 'Ambitious, grounded, and looking for an equal partner.',
    profile_description: 'Working in investment banking, balance professional ambition with cultural roots.',
    about: 'I love fitness, financial literacy, and weekend brunches with family.',
    primary_no: '+91-9876543213',
    whatsapp_no: '+91-9876543213',
    preferred_contact_method: 'WhatsApp',
    best_time_to_call: '6 PM to 8 PM',
    contact_person: 'Mother',
    full_address: 'Lokhandwala, Andheri West, Mumbai',
    family_type: 'Nuclear',
    financial_status: 'Upper Middle Class',
    interests: ['Finance', 'Fitness', 'Travel'],
    partner_age_min: 26,
    partner_age_max: 32,
    partner_height_min: 170.0,
    partner_height_max: 185.0,
  },
  {
    id: 6,
    user_id: 6,
    name: 'Yasmin Qureshi',
    age: 27,
    gender: 'Female',
    marital_status: 'Divorced',
    language: 'Urdu',
    religion: 'Islam',
    sect: 'Sunni',
    present_location: 'Hyderabad',
    present_country: 'India',
    present_state: 'Telangana',
    partner_country_pref: ['India'],
    partner_state_pref: ['All'],
    profession: 'Teacher',
    annual_income: 400000.0,
    height: 160.0,
    weight: 60.0,
    differently_abled: true, // Differently abled category
    health_or_disabilities: 'Minor polio in left leg',
    orphan_poor_girl: false,
    education: 'M.A. Education',
    tagline: 'Educator seeking an open-minded and kind life partner for a fresh start.',
    profile_description: 'High school literature teacher who believes in empathy, second chances, and mutual respect.',
    about: 'I enjoy teaching, poetry, and spending time with my family.',
    primary_no: '+91-9876543214',
    whatsapp_no: '+91-9876543214',
    preferred_contact_method: 'WhatsApp',
    best_time_to_call: '4 PM to 7 PM',
    contact_person: 'Parent',
    full_address: 'Banjara Hills, Hyderabad',
    family_type: 'Joint',
    financial_status: 'Middle Class',
    interests: ['Literature', 'Teaching', 'Poetry'],
    partner_age_min: 27,
    partner_age_max: 34,
    partner_height_min: 165.0,
    partner_height_max: 180.0,
  },
  {
    id: 7,
    user_id: 7,
    name: 'Mariam Ali',
    age: 23,
    gender: 'Female',
    marital_status: 'Never Married',
    language: 'Malayalam',
    religion: 'Islam',
    sect: 'Sunni',
    present_location: 'Kochi',
    present_country: 'India',
    present_state: 'Kerala',
    partner_country_pref: ['India'],
    partner_state_pref: ['All'],
    profession: 'HR Coordinator',
    annual_income: 350000.0,
    height: 154.0,
    weight: 50.0,
    differently_abled: false,
    orphan_poor_girl: true, // Poor Girls category
    education: 'BBA',
    health_or_disabilities: null,
    tagline: 'Simple, respectful, and family-centered girl.',
    profile_description: 'Looking for a pious, hardworking partner who values simplicity and modesty.',
    about: 'I am a cheerful person who loves cooking traditional recipes and spending time in nature.',
    primary_no: '+91-9876543215',
    whatsapp_no: '+91-9876543215',
    preferred_contact_method: 'WhatsApp',
    best_time_to_call: '6 PM to 9 PM',
    contact_person: 'Brother',
    full_address: 'Marine Drive, Kochi',
    family_type: 'Nuclear',
    financial_status: 'Middle Class',
    interests: ['Cooking', 'Gardening', 'Community'],
    partner_age_min: 24,
    partner_age_max: 29,
    partner_height_min: 165.0,
    partner_height_max: 180.0,
  },
  {
    id: 8,
    user_id: 8,
    name: 'Bilal Siddiqui',
    age: 29,
    gender: 'Male',
    marital_status: 'Never Married',
    language: 'Urdu',
    religion: 'Islam',
    sect: 'Sunni',
    present_location: 'Lucknow',
    present_country: 'India',
    present_state: 'Uttar Pradesh',
    partner_country_pref: ['India'],
    partner_state_pref: ['All'],
    profession: 'Lecturer',
    annual_income: 700000.0,
    height: 175.0,
    weight: 70.0,
    differently_abled: false,
    orphan_poor_girl: false,
    education: 'M.Sc Physics',
    health_or_disabilities: null,
    tagline: 'University professor seeking an educated and culturally rooted partner.',
    profile_description: 'Academic lecturer with keen interest in science and cultural heritage.',
    about: 'I believe in honest communication, gentle demeanor, and family harmony.',
    primary_no: '+91-9876543216',
    whatsapp_no: '+91-9876543216',
    preferred_contact_method: 'WhatsApp',
    best_time_to_call: '5 PM to 8 PM',
    contact_person: 'Self / Father',
    full_address: 'Hazratganj, Lucknow',
    family_type: 'Joint',
    financial_status: 'Middle Class',
    interests: ['Physics', 'Teaching', 'Reading'],
    partner_age_min: 22,
    partner_age_max: 27,
    partner_height_min: 155.0,
    partner_height_max: 170.0,
  },
  {
    id: 9,
    user_id: 9,
    name: 'Yousef Patel',
    age: 31,
    gender: 'Male',
    marital_status: 'Never Married',
    language: 'Gujarati',
    religion: 'Islam',
    sect: 'Sunni',
    present_location: 'Ahmedabad',
    present_country: 'India',
    present_state: 'Gujarat',
    partner_country_pref: ['India'],
    partner_state_pref: ['All'],
    profession: 'Business Owner',
    annual_income: 3000000.0,
    height: 182.0,
    weight: 80.0,
    differently_abled: false,
    orphan_poor_girl: false,
    education: 'Bachelor of Commerce',
    health_or_disabilities: null,
    tagline: 'Entrepreneur looking for a compatible and affectionate life partner.',
    profile_description: 'Managing family exports business with global clients, looking to settle down.',
    about: 'I enjoy travelling the world, entrepreneurship, and fine dining.',
    primary_no: '+91-9876543217',
    whatsapp_no: '+91-9876543217',
    preferred_contact_method: 'WhatsApp',
    best_time_to_call: '7 PM to 10 PM',
    contact_person: 'Self',
    full_address: 'SG Highway, Ahmedabad',
    family_type: 'Nuclear',
    financial_status: 'Affluent',
    interests: ['Business', 'Travel', 'Cars'],
    partner_age_min: 22,
    partner_age_max: 28,
    partner_height_min: 158.0,
    partner_height_max: 175.0,
  },
  {
    id: 10,
    user_id: 10,
    name: 'Sameer MaleTester',
    age: 27,
    gender: 'Male',
    marital_status: 'Never Married',
    language: 'Hindi',
    religion: 'Islam',
    sect: 'Sunni',
    present_location: 'Delhi',
    present_country: 'India',
    present_state: 'Delhi',
    partner_country_pref: ['India'],
    partner_state_pref: ['All'],
    profession: 'Marketing Manager',
    annual_income: 800000.0,
    height: 175.0,
    weight: 70.0,
    differently_abled: false,
    orphan_poor_girl: false,
    education: 'MBA Marketing',
    health_or_disabilities: null,
    tagline: 'Friendly and ambitious digital marketer.',
    profile_description: 'Looking for a lively, understanding partner.',
    about: 'I love sports, road trips, and exploring new cuisines.',
    primary_no: '+91-9876543218',
    whatsapp_no: '+91-9876543218',
    preferred_contact_method: 'WhatsApp',
    best_time_to_call: '6 PM to 9 PM',
    contact_person: 'Self',
    full_address: 'South Extension, Delhi',
    family_type: 'Nuclear',
    financial_status: 'Middle Class',
    interests: ['Marketing', 'Sports', 'Road Trips'],
    partner_age_min: 22,
    partner_age_max: 28,
    partner_height_min: 155.0,
    partner_height_max: 170.0,
  },
  {
    id: 11,
    user_id: 11,
    name: 'Sara FemaleTester',
    age: 24,
    gender: 'Female',
    marital_status: 'Never Married',
    language: 'Urdu',
    religion: 'Islam',
    sect: 'Sunni',
    present_location: 'Mumbai',
    present_country: 'India',
    present_state: 'Maharashtra',
    partner_country_pref: ['India'],
    partner_state_pref: ['All'],
    profession: 'Content Writer',
    annual_income: 450000.0,
    height: 160.0,
    weight: 52.0,
    differently_abled: false,
    orphan_poor_girl: false,
    education: 'B.A. English Literature',
    health_or_disabilities: null,
    tagline: 'Creative writer seeking a sincere and loving life partner.',
    profile_description: 'Passionate about storytelling and literature.',
    about: 'I enjoy writing, poetry, and visiting heritage places.',
    primary_no: '+91-9876543219',
    whatsapp_no: '+91-9876543219',
    preferred_contact_method: 'WhatsApp',
    best_time_to_call: '5 PM to 8 PM',
    contact_person: 'Self / Parent',
    full_address: 'Bandra, Mumbai',
    family_type: 'Nuclear',
    financial_status: 'Middle Class',
    interests: ['Writing', 'Poetry', 'Books'],
    partner_age_min: 24,
    partner_age_max: 30,
    partner_height_min: 165.0,
    partner_height_max: 185.0,
  },
];

const INITIAL_PHOTOS = [
  // 1. Admin
  { id: 1, user_id: 1, url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=800&q=80', is_main: true, is_approved: true },
  // 2. Ahmed Khan
  { id: 2, user_id: 2, url: 'https://images.unsplash.com/photo-1506794778244-f4e3c50a1018?auto=format&fit=crop&w=800&q=80', is_main: true, is_approved: true },
  { id: 3, user_id: 2, url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80', is_main: false, is_approved: true },
  { id: 4, user_id: 2, url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80', is_main: false, is_approved: true },
  // 3. Fatima Bi
  { id: 5, user_id: 3, url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80', is_main: true, is_approved: true },
  { id: 6, user_id: 3, url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80', is_main: false, is_approved: true },
  { id: 7, user_id: 3, url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80', is_main: false, is_approved: true },
  // 4. Aisha Rahman
  { id: 8, user_id: 4, url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80', is_main: true, is_approved: true },
  { id: 9, user_id: 4, url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80', is_main: false, is_approved: true },
  { id: 10, user_id: 4, url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80', is_main: false, is_approved: true },
  // 5. Zainab Sheikh
  { id: 11, user_id: 5, url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80', is_main: true, is_approved: true },
  { id: 12, user_id: 5, url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80', is_main: false, is_approved: true },
  { id: 13, user_id: 5, url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=800&q=80', is_main: false, is_approved: true },
  // 6. Yasmin Qureshi
  { id: 14, user_id: 6, url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80', is_main: true, is_approved: true },
  { id: 15, user_id: 6, url: 'https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=800&q=80', is_main: false, is_approved: true },
  { id: 16, user_id: 6, url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80', is_main: false, is_approved: true },
  // 7. Mariam Ali
  { id: 17, user_id: 7, url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80', is_main: true, is_approved: true },
  { id: 18, user_id: 7, url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80', is_main: false, is_approved: true },
  { id: 19, user_id: 7, url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80', is_main: false, is_approved: true },
  { id: 20, user_id: 7, url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80', is_main: false, is_approved: false }, // Pending Admin
  // 8. Bilal Siddiqui
  { id: 21, user_id: 8, url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80', is_main: true, is_approved: true },
  { id: 22, user_id: 8, url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80', is_main: false, is_approved: true },
  { id: 23, user_id: 8, url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80', is_main: false, is_approved: false }, // Pending Admin
  // 9. Yousef Patel
  { id: 24, user_id: 9, url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=800&q=80', is_main: true, is_approved: true },
  { id: 25, user_id: 9, url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80', is_main: false, is_approved: true },
  { id: 26, user_id: 9, url: 'https://images.unsplash.com/photo-1506794778244-f4e3c50a1018?auto=format&fit=crop&w=800&q=80', is_main: false, is_approved: true },
  // 10 & 11
  { id: 27, user_id: 10, url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80', is_main: true, is_approved: true },
  { id: 28, user_id: 11, url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80', is_main: true, is_approved: true },
];

const INITIAL_INTERESTS = [
  { id: 1, sender_id: 2, receiver_id: 4, status: 'Pending', created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 2, sender_id: 2, receiver_id: 3, status: 'Accepted', created_at: new Date(Date.now() - 172800000).toISOString() },
  { id: 3, sender_id: 5, receiver_id: 2, status: 'Pending', created_at: new Date(Date.now() - 43200000).toISOString() },
  { id: 4, sender_id: 10, receiver_id: 11, status: 'Pending', created_at: new Date().toISOString() },
  { id: 5, sender_id: 10, receiver_id: 3, status: 'Accepted', created_at: new Date().toISOString() },
  { id: 6, sender_id: 10, receiver_id: 4, status: 'Declined', created_at: new Date().toISOString() },
  { id: 7, sender_id: 5, receiver_id: 10, status: 'Pending', created_at: new Date().toISOString() },
  { id: 8, sender_id: 6, receiver_id: 10, status: 'Accepted', created_at: new Date().toISOString() },
  { id: 9, sender_id: 7, receiver_id: 10, status: 'Declined', created_at: new Date().toISOString() },
  { id: 10, sender_id: 11, receiver_id: 9, status: 'Pending', created_at: new Date().toISOString() },
  { id: 11, sender_id: 11, receiver_id: 8, status: 'Accepted', created_at: new Date().toISOString() },
  { id: 12, sender_id: 11, receiver_id: 2, status: 'Declined', created_at: new Date().toISOString() },
];

const INITIAL_MESSAGES = [
  {
    id: 1,
    sender_id: 2,
    receiver_id: 3,
    message_text: 'Assalamu alaikum Fatima, thanks for accepting my interest request.',
    message_type: 'chat',
    is_read: true,
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 2,
    sender_id: 3,
    receiver_id: 2,
    message_text: 'Walaikum assalam Ahmed. Glad to connect. Tell me more about your family background.',
    message_type: 'chat',
    is_read: true,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 3,
    sender_id: 2,
    receiver_id: 3,
    message_text: 'Sure, we are a nuclear family based in Mumbai. My father is retired, and mother is a homemaker.',
    message_type: 'chat',
    is_read: true,
    created_at: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 4,
    sender_id: 3,
    receiver_id: 2,
    message_text: 'Voice Call',
    message_type: 'call',
    call_duration: 480,
    is_read: true,
    created_at: new Date(Date.now() - 900000).toISOString(),
  },
];

const INITIAL_VISITS = [
  { id: 1, visitor_id: 2, visited_id: 3, created_at: new Date().toISOString() },
  { id: 2, visitor_id: 2, visited_id: 4, created_at: new Date().toISOString() },
  { id: 3, visitor_id: 5, visited_id: 2, created_at: new Date().toISOString() },
  { id: 4, visitor_id: 3, visited_id: 2, created_at: new Date().toISOString() },
];

const INITIAL_FAVOURITES = [
  { id: 1, user_id: 2, favourited_id: 3, created_at: new Date().toISOString() },
];

const INITIAL_NOTES = [
  { id: 1, user_id: 2, profile_id: 3, note_text: 'Spoke with her father, seems very polite and well-educated.', created_at: new Date().toISOString() },
];

const INITIAL_CONTACT_VIEWS = [
  { id: 1, user_id: 3, viewed_user_id: 2, created_at: new Date().toISOString() },
];

interface MockDB {
  users: typeof INITIAL_USERS;
  profiles: typeof INITIAL_PROFILES;
  photos: typeof INITIAL_PHOTOS;
  interests: typeof INITIAL_INTERESTS;
  messages: typeof INITIAL_MESSAGES;
  visits: typeof INITIAL_VISITS;
  favourites: typeof INITIAL_FAVOURITES;
  notes: typeof INITIAL_NOTES;
  contactViews: typeof INITIAL_CONTACT_VIEWS;
  blockedUsers: Array<{ user_id: number; blocked_id: number }>;
  passedUsers: Array<{ user_id: number; passed_id: number }>;
  feedback: Array<{ user_id: number; rating: number; comment: string; created_at: string }>;
}

let memoryDb: MockDB | null = null;

// --- Phone Number Detection & Stripping Utility ---
const PHONE_REGEX = /(?:(?:\+|00)\d{1,3}[-.\s]?)?(?:0\d{1,4}[-.\s]?)?(?:\d[-.\s]?){7,13}\d/gi;
const DIGIT_WORDS: Record<string, string> = {
  zero: '0', one: '1', two: '2', three: '3', four: '4',
  five: '5', six: '6', seven: '7', eight: '8', nine: '9',
  oh: '0',
};
const DIGIT_WORD_PATTERN = new RegExp(
  '(?:(?:' + Object.keys(DIGIT_WORDS).join('|') + ')\\s*){7,}', 'gi'
);

function containsPhoneNumber(text: string | null | undefined): boolean {
  if (!text) return false;
  PHONE_REGEX.lastIndex = 0;
  if (PHONE_REGEX.test(text)) return true;
  DIGIT_WORD_PATTERN.lastIndex = 0;
  if (DIGIT_WORD_PATTERN.test(text)) return true;
  return false;
}

function stripPhoneNumbers(text: string | null | undefined): string | null | undefined {
  if (!text) return text;
  PHONE_REGEX.lastIndex = 0;
  let result = text.replace(PHONE_REGEX, '[number removed]');
  DIGIT_WORD_PATTERN.lastIndex = 0;
  result = result.replace(DIGIT_WORD_PATTERN, '[number removed]');
  return result;
}

// Fields where phone numbers should be stripped automatically in profiles
const PHONE_SANITIZE_FIELDS = new Set([
  'tagline', 'profile_description', 'about',
  'marriage_goals', 'marriage_plan', 'additional_marriage_plan',
  'education_profession_description', 'appearance_description',
  'family_details', 'personality', 'partner_expectation',
  'health_or_disabilities',
]);

let currentUserId: number = 2; // Default Ahmed Khan

// Load or initialize DB
async function getDb(): Promise<MockDB> {
  if (memoryDb) return memoryDb;

  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      memoryDb = JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Error reading mock db from storage:', e);
  }

  if (!memoryDb) {
    memoryDb = {
      users: JSON.parse(JSON.stringify(INITIAL_USERS)),
      profiles: JSON.parse(JSON.stringify(INITIAL_PROFILES)),
      photos: JSON.parse(JSON.stringify(INITIAL_PHOTOS)),
      interests: JSON.parse(JSON.stringify(INITIAL_INTERESTS)),
      messages: JSON.parse(JSON.stringify(INITIAL_MESSAGES)),
      visits: JSON.parse(JSON.stringify(INITIAL_VISITS)),
      favourites: JSON.parse(JSON.stringify(INITIAL_FAVOURITES)),
      notes: JSON.parse(JSON.stringify(INITIAL_NOTES)),
      contactViews: JSON.parse(JSON.stringify(INITIAL_CONTACT_VIEWS)),
      blockedUsers: [],
      passedUsers: [],
      feedback: [],
    };
    await saveDb(memoryDb);
  }

  try {
    const savedUserId = await AsyncStorage.getItem(CURRENT_USER_KEY);
    if (savedUserId) {
      currentUserId = Number(savedUserId);
    }
  } catch {}

  return memoryDb!;
}

// Persist DB
async function saveDb(db: MockDB): Promise<void> {
  memoryDb = db;
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    console.error('Error saving mock DB to storage:', e);
  }
}

// Reset DB back to seed defaults
export async function resetMockData(): Promise<void> {
  memoryDb = null;
  await AsyncStorage.removeItem(STORAGE_KEY);
  await AsyncStorage.removeItem(CURRENT_USER_KEY);
  await AsyncStorage.removeItem('user_token');
  currentUserId = 2;
  await getDb();
}

// Switch current active demo user
export async function switchDemoUser(userId: number): Promise<void> {
  currentUserId = userId;
  await AsyncStorage.setItem(CURRENT_USER_KEY, String(userId));
  await AsyncStorage.setItem('user_token', `offline_token_${userId}_${Date.now()}`);
}

// Simulated network latency
const delay = (ms: number = 50) => new Promise((resolve) => setTimeout(resolve, ms));

function buildFullProfile(profile: any, db: MockDB) {
  if (!profile) return null;
  const userPhotos = db.photos.filter((p) => p.user_id === profile.user_id);
  const user = db.users.find((u) => u.id === profile.user_id);

  return {
    ...profile,
    user_id: profile.user_id,
    is_verified: user?.id_verification_status === 'Verified',
    membership_status: user?.membership_status || 'Free',
    plan_type: user?.plan_type,
    last_active_at: user?.last_active_at || new Date().toISOString(),
    photos: userPhotos.length > 0 ? userPhotos : [
      { id: 999, user_id: profile.user_id, url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', is_main: true, is_approved: true }
    ],
  };
}

export const mockApi = {
  // Auth
  register: async (email: string, _password: string) => {
    await delay();
    const db = await getDb();
    let existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('User with this email already exists.');
    }

    const newId = Math.max(...db.users.map((u) => u.id), 0) + 1;
    const newUser = {
      id: newId,
      email: email.trim(),
      password: _password || 'password123',
      is_admin: false,
      membership_status: 'Free',
      plan_type: null,
      remaining_contact_views: 0,
      remaining_messages: 50,
      remaining_call_time: 0,
      credits: 25,
      plan_validity: null,
      id_verification_status: 'Unverified',
      id_verification_document_url: null,
      last_active_at: new Date().toISOString(),
    };

    const newProfile = {
      id: newId,
      user_id: newId,
      name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      age: 26,
      gender: 'Male',
      marital_status: 'Never Married',
      language: 'English',
      religion: 'Islam',
      sect: 'Sunni',
      present_location: 'Mumbai',
      present_country: 'India',
      present_state: 'Maharashtra',
      partner_country_pref: ['India'],
      partner_state_pref: ['All'],
      profession: 'Professional',
      annual_income: 800000.0,
      height: 172.0,
      weight: 68.0,
      differently_abled: false,
      orphan_poor_girl: false,
      education: 'Graduate',
      health_or_disabilities: null,
      tagline: 'Looking for a pious, loving partner.',
      profile_description: 'Self-created matrimonial profile.',
      about: 'I am ambitious, kind-hearted, and seeking a life partner with compatible values.',
      primary_no: '+91-9876500000',
      whatsapp_no: '+91-9876500000',
      preferred_contact_method: 'WhatsApp',
      best_time_to_call: 'Evening',
      contact_person: 'Self',
      full_address: 'Mumbai, India',
      family_type: 'Nuclear',
      financial_status: 'Middle Class',
      interests: ['Reading', 'Travel'],
      partner_age_min: 21,
      partner_age_max: 29,
      partner_height_min: 150.0,
      partner_height_max: 185.0,
    };

    db.users.push(newUser);
    db.profiles.push(newProfile);
    db.photos.push({
      id: Math.max(...db.photos.map((p) => p.id), 0) + 1,
      user_id: newId,
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      is_main: true,
      is_approved: true,
    });

    await saveDb(db);
    return { message: 'Registration successful', id: newId };
  },

  login: async (username: string, _password?: string) => {
    await delay();
    const db = await getDb();
    const normalized = username.trim().toLowerCase();
    
    // Find user by email or fallback to Ahmed Khan
    let user = db.users.find((u) => u.email.toLowerCase() === normalized);
    
    // If not found, auto-create a user so testing is completely frictionless
    if (!user) {
      await mockApi.register(normalized, _password || 'password123');
      user = db.users.find((u) => u.email.toLowerCase() === normalized);
    }

    if (user) {
      currentUserId = user.id;
      await AsyncStorage.setItem(CURRENT_USER_KEY, String(user.id));
      const token = `offline_token_${user.id}_${Date.now()}`;
      await AsyncStorage.setItem('user_token', token);
      return { access_token: token };
    }

    throw new Error('User not found.');
  },

  getMe: async () => {
    await delay();
    const db = await getDb();
    const user = db.users.find((u) => u.id === currentUserId) || db.users[1];
    return { ...user };
  },

  verifyId: async (documentUrl: string) => {
    await delay();
    const db = await getDb();
    const user = db.users.find((u) => u.id === currentUserId);
    if (user) {
      user.id_verification_status = 'Pending';
      user.id_verification_document_url = documentUrl;
      await saveDb(db);
    }
    return { message: 'Document submitted for verification' };
  },

  uploadVerifyId: async (_fileData: any) => {
    await delay();
    const mockUrl = 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80';
    return mockApi.verifyId(mockUrl);
  },

  // Profiles
  getMyProfile: async () => {
    await delay();
    const db = await getDb();
    const profile = db.profiles.find((p) => p.user_id === currentUserId) || db.profiles[1];
    return buildFullProfile(profile, db);
  },

  updateMyProfile: async (data: any) => {
    await delay();
    const db = await getDb();
    let profile = db.profiles.find((p) => p.user_id === currentUserId);
    
    // Sanitize text fields — strip phone numbers from description-type fields
    const sanitizedData: any = {};
    for (const [key, val] of Object.entries(data)) {
      if (PHONE_SANITIZE_FIELDS.has(key) && typeof val === 'string') {
        sanitizedData[key] = stripPhoneNumbers(val);
      } else {
        sanitizedData[key] = val;
      }
    }
    
    if (!profile) {
      const newProf: any = {
        id: currentUserId,
        user_id: currentUserId,
        name: 'Ahmed Khan',
        age: 28,
        gender: 'Male',
        marital_status: 'Never Married',
        language: 'Urdu',
        religion: 'Islam',
        sect: 'Sunni',
        present_location: 'Mumbai',
        present_country: 'India',
        present_state: 'Maharashtra',
        partner_country_pref: ['India'],
        partner_state_pref: ['All'],
        profession: 'Software Engineer',
        annual_income: 1200000.0,
        height: 178.0,
        weight: 74.0,
        differently_abled: false,
        orphan_poor_girl: false,
        education: 'B.Tech Computer Science',
        health_or_disabilities: null,
        tagline: 'Looking for a pious partner.',
        profile_description: 'Matrimonial profile.',
        about: 'Simple and family-oriented.',
        primary_no: '+91-9876543210',
        whatsapp_no: '+91-9876543210',
        preferred_contact_method: 'WhatsApp',
        best_time_to_call: 'Evening',
        contact_person: 'Self',
        full_address: 'Mumbai',
        family_type: 'Nuclear',
        financial_status: 'Middle Class',
        interests: ['Reading'],
        partner_age_min: 21,
        partner_age_max: 27,
        partner_height_min: 155.0,
        partner_height_max: 170.0,
        ...sanitizedData,
      };
      db.profiles.push(newProf);
      profile = newProf;
    } else {
      Object.assign(profile, sanitizedData);
    }
    await saveDb(db);
    return buildFullProfile(profile, db);
  },

  getMatches: async (category?: string) => {
    await delay();
    const db = await getDb();
    const meProfile = db.profiles.find((p) => p.user_id === currentUserId);
    const myGender = meProfile?.gender || 'Male';
    const oppositeGender = myGender === 'Male' ? 'Female' : 'Male';

    const blockedIds = new Set(db.blockedUsers.filter((b) => b.user_id === currentUserId).map((b) => b.blocked_id));
    const passedIds = new Set(db.passedUsers.filter((p) => p.user_id === currentUserId).map((p) => p.passed_id));

    let matches = db.profiles
      .filter((p) => p.user_id !== currentUserId && !blockedIds.has(p.user_id) && !passedIds.has(p.user_id))
      .map((p) => buildFullProfile(p, db));

    // Prefer opposite gender matches (or all if testing)
    const genderMatches = matches.filter((p) => p.gender === oppositeGender);
    if (genderMatches.length > 0) {
      matches = genderMatches;
    }

    if (category) {
      const cat = category.toLowerCase();
      if (cat === 'near_me') {
        const myCity = meProfile?.present_location || 'Mumbai';
        matches = matches.filter((p) => p.present_location === myCity || p.present_state === meProfile?.present_state);
      } else if (cat === 'verified') {
        matches = matches.filter((p) => p.is_verified);
      } else if (cat === 'premium') {
        matches = matches.filter((p) => p.membership_status === 'Premium');
      } else if (cat === 'differently_abled') {
        matches = matches.filter((p) => p.differently_abled);
      } else if (cat === 'poor_girls' || cat === 'orphan') {
        matches = matches.filter((p) => p.orphan_poor_girl);
      }
    }

    return matches;
  },

  searchProfiles: async (params: Record<string, string | number | boolean>) => {
    await delay();
    const db = await getDb();
    let results = db.profiles
      .filter((p) => p.user_id !== currentUserId)
      .map((p) => buildFullProfile(p, db));

    if (params.gender) {
      results = results.filter((p) => p.gender.toLowerCase() === String(params.gender).toLowerCase());
    }
    if (params.age_min) {
      results = results.filter((p) => p.age >= Number(params.age_min));
    }
    if (params.age_max) {
      results = results.filter((p) => p.age <= Number(params.age_max));
    }
    if (params.religion && params.religion !== 'All') {
      results = results.filter((p) => p.religion?.toLowerCase() === String(params.religion).toLowerCase());
    }
    if (params.sect && params.sect !== 'All') {
      results = results.filter((p) => p.sect?.toLowerCase() === String(params.sect).toLowerCase());
    }
    if (params.marital_status && params.marital_status !== 'All') {
      results = results.filter((p) => p.marital_status?.toLowerCase() === String(params.marital_status).toLowerCase());
    }
    if (params.location) {
      const loc = String(params.location).toLowerCase();
      results = results.filter((p) => p.present_location?.toLowerCase().includes(loc) || p.present_state?.toLowerCase().includes(loc));
    }

    return results;
  },

  getProfileById: async (id: number) => {
    await delay();
    const db = await getDb();
    const profile = db.profiles.find((p) => p.id === Number(id) || p.user_id === Number(id));
    if (!profile) throw new Error('Profile not found');

    // Record visit if visitor is not profile owner
    if (profile.user_id !== currentUserId) {
      const hasVisited = db.visits.some((v) => v.visitor_id === currentUserId && v.visited_id === profile.user_id);
      if (!hasVisited) {
        db.visits.push({
          id: Math.max(...db.visits.map((v) => v.id), 0) + 1,
          visitor_id: currentUserId,
          visited_id: profile.user_id,
          created_at: new Date().toISOString(),
        });
        await saveDb(db);
      }
    }

    return buildFullProfile(profile, db);
  },

  getProfileByUserId: async (userId: number) => {
    await delay();
    const db = await getDb();
    const profile = db.profiles.find((p) => p.user_id === Number(userId));
    if (!profile) throw new Error('Profile not found');
    return buildFullProfile(profile, db);
  },

  // Photos
  getPhotos: async () => {
    await delay();
    const db = await getDb();
    return db.photos.filter((p) => p.user_id === currentUserId);
  },

  uploadPhoto: async (url: string, isMain: boolean = false) => {
    await delay();
    const db = await getDb();
    const newId = Math.max(...db.photos.map((p) => p.id), 0) + 1;
    if (isMain) {
      db.photos.forEach((p) => {
        if (p.user_id === currentUserId) p.is_main = false;
      });
    }
    const newPhoto = {
      id: newId,
      user_id: currentUserId,
      url,
      is_main: isMain,
      is_approved: true,
    };
    db.photos.push(newPhoto);
    await saveDb(db);
    return newPhoto;
  },

  setMainPhoto: async (id: number) => {
    await delay();
    const db = await getDb();
    db.photos.forEach((p) => {
      if (p.user_id === currentUserId) {
        p.is_main = p.id === Number(id);
      }
    });
    await saveDb(db);
    return { message: 'Main photo updated successfully' };
  },

  deletePhoto: async (id: number) => {
    await delay();
    const db = await getDb();
    db.photos = db.photos.filter((p) => !(p.user_id === currentUserId && p.id === Number(id)));
    await saveDb(db);
    return { message: 'Photo deleted successfully' };
  },

  // Explore / Interactions
  sendInterest: async (receiverId: number) => {
    await delay();
    const db = await getDb();
    const existing = db.interests.find((i) => i.sender_id === currentUserId && i.receiver_id === Number(receiverId));
    if (existing) {
      existing.status = 'Pending';
      await saveDb(db);
      return { message: 'Interest sent successfully', id: existing.id };
    }

    const newId = Math.max(...db.interests.map((i) => i.id), 0) + 1;
    const newInterest = {
      id: newId,
      sender_id: currentUserId,
      receiver_id: Number(receiverId),
      status: 'Pending',
      created_at: new Date().toISOString(),
    };
    db.interests.push(newInterest);
    await saveDb(db);
    return { message: 'Interest sent successfully', id: newId };
  },

  cancelInterest: async (interestId: number) => {
    await delay();
    const db = await getDb();
    db.interests = db.interests.filter((i) => i.id !== Number(interestId));
    await saveDb(db);
    return { message: 'Interest cancelled successfully' };
  },

  cancelInterestByUser: async (receiverId: number) => {
    await delay();
    const db = await getDb();
    db.interests = db.interests.filter((i) => !(i.sender_id === currentUserId && i.receiver_id === Number(receiverId)));
    await saveDb(db);
    return { message: 'Interest cancelled' };
  },

  getInterestStatus: async (targetUserId: number) => {
    await delay();
    const db = await getDb();
    const sent = db.interests.find((i) => i.sender_id === currentUserId && i.receiver_id === Number(targetUserId));
    const received = db.interests.find((i) => i.sender_id === Number(targetUserId) && i.receiver_id === currentUserId);

    return {
      sent: sent ? { id: sent.id, status: sent.status, created_at: sent.created_at } : null,
      received: received ? { id: received.id, status: received.status, created_at: received.created_at } : null,
    };
  },

  getReceivedInterests: async () => {
    await delay();
    const db = await getDb();
    const received = db.interests.filter((i) => i.receiver_id === currentUserId);
    return received.map((item) => {
      const senderProfile = db.profiles.find((p) => p.user_id === item.sender_id);
      return {
        ...item,
        sender_profile: buildFullProfile(senderProfile, db),
      };
    });
  },

  getSentInterests: async () => {
    await delay();
    const db = await getDb();
    const sent = db.interests.filter((i) => i.sender_id === currentUserId);
    return sent.map((item) => {
      const receiverProfile = db.profiles.find((p) => p.user_id === item.receiver_id);
      return {
        ...item,
        receiver_profile: buildFullProfile(receiverProfile, db),
      };
    });
  },

  respondToInterest: async (interestId: number, status: 'Accepted' | 'Declined') => {
    await delay();
    const db = await getDb();
    const interest = db.interests.find((i) => i.id === Number(interestId));
    if (interest) {
      interest.status = status;
      await saveDb(db);
    }
    return { message: `Interest ${status.toLowerCase()} successfully` };
  },

  getVisitors: async () => {
    await delay();
    const db = await getDb();
    const myVisits = db.visits.filter((v) => v.visited_id === currentUserId);
    return myVisits.map((v) => {
      const visitorProfile = db.profiles.find((p) => p.user_id === v.visitor_id);
      return {
        ...v,
        visitor: buildFullProfile(visitorProfile, db),
      };
    });
  },

  getVisitedByMe: async () => {
    await delay();
    const db = await getDb();
    const visits = db.visits.filter((v) => v.visitor_id === currentUserId);
    return visits.map((v) => {
      const visitedProfile = db.profiles.find((p) => p.user_id === v.visited_id);
      return {
        ...v,
        visited: buildFullProfile(visitedProfile, db),
      };
    });
  },

  viewContact: async (targetUserId: number) => {
    await delay();
    const db = await getDb();
    const targetProfile = db.profiles.find((p) => p.user_id === Number(targetUserId));
    if (!targetProfile) throw new Error('Profile not found');

    const me = db.users.find((u) => u.id === currentUserId);
    if (me && me.remaining_contact_views > 0) {
      me.remaining_contact_views -= 1;
    } else if (me && me.credits >= 10) {
      me.credits -= 10;
    }

    const alreadyViewed = db.contactViews.some((cv) => cv.user_id === currentUserId && cv.viewed_user_id === Number(targetUserId));
    if (!alreadyViewed) {
      db.contactViews.push({
        id: Math.max(...db.contactViews.map((c) => c.id), 0) + 1,
        user_id: currentUserId,
        viewed_user_id: Number(targetUserId),
        created_at: new Date().toISOString(),
      });
    }

    await saveDb(db);
    return {
      primary_no: targetProfile.primary_no,
      whatsapp_no: targetProfile.whatsapp_no,
      full_address: targetProfile.full_address,
      contact_person: targetProfile.contact_person,
      best_time_to_call: targetProfile.best_time_to_call,
    };
  },

  getViewedContacts: async () => {
    await delay();
    const db = await getDb();
    const myViews = db.contactViews.filter((cv) => cv.user_id === currentUserId);
    return myViews.map((cv) => {
      const p = db.profiles.find((prof) => prof.user_id === cv.viewed_user_id);
      return buildFullProfile(p, db);
    }).filter(Boolean);
  },

  getFavourites: async () => {
    await delay();
    const db = await getDb();
    const myFavs = db.favourites.filter((f) => f.user_id === currentUserId);
    return myFavs.map((f) => {
      const p = db.profiles.find((prof) => prof.user_id === f.favourited_id);
      return buildFullProfile(p, db);
    }).filter(Boolean);
  },

  addFavourite: async (favouritedId: number) => {
    await delay();
    const db = await getDb();
    const exists = db.favourites.some((f) => f.user_id === currentUserId && f.favourited_id === Number(favouritedId));
    if (!exists) {
      db.favourites.push({
        id: Math.max(...db.favourites.map((f) => f.id), 0) + 1,
        user_id: currentUserId,
        favourited_id: Number(favouritedId),
        created_at: new Date().toISOString(),
      });
      await saveDb(db);
    }
    return { message: 'Profile added to favourites' };
  },

  removeFavourite: async (targetUserId: number) => {
    await delay();
    const db = await getDb();
    db.favourites = db.favourites.filter((f) => !(f.user_id === currentUserId && f.favourited_id === Number(targetUserId)));
    await saveDb(db);
    return { message: 'Removed from favourites' };
  },

  getNote: async (profileId: number) => {
    await delay();
    const db = await getDb();
    const note = db.notes.find((n) => n.user_id === currentUserId && n.profile_id === Number(profileId));
    return { note_text: note?.note_text || '' };
  },

  saveNote: async (profileId: number, noteText: string) => {
    await delay();
    const db = await getDb();
    let note = db.notes.find((n) => n.user_id === currentUserId && n.profile_id === Number(profileId));
    if (note) {
      note.note_text = noteText;
    } else {
      db.notes.push({
        id: Math.max(...db.notes.map((n) => n.id), 0) + 1,
        user_id: currentUserId,
        profile_id: Number(profileId),
        note_text: noteText,
        created_at: new Date().toISOString(),
      });
    }
    await saveDb(db);
    return { message: 'Note saved successfully' };
  },

  blockUser: async (blockedId: number) => {
    await delay();
    const db = await getDb();
    db.blockedUsers.push({ user_id: currentUserId, blocked_id: Number(blockedId) });
    await saveDb(db);
    return { message: 'User blocked' };
  },

  passUser: async (passedId: number) => {
    await delay();
    const db = await getDb();
    db.passedUsers.push({ user_id: currentUserId, passed_id: Number(passedId) });
    await saveDb(db);
    return { message: 'User passed' };
  },

  // Inbox & Chat
  sendMessage: async (receiverId: number, text: string, type: 'chat' | 'request' = 'chat', duration?: number) => {
    await delay();
    const db = await getDb();
    const user = db.users.find((u) => u.id === currentUserId);

    // Check for phone numbers in message text — reject if found
    if (containsPhoneNumber(text)) {
      throw new Error('Sharing phone numbers via chat is not allowed. Contact details can only be viewed through the profile unlock feature.');
    }

    // Only active plan users can send messages (skip for admin)
    if (user && !(user as any).is_admin) {
      const hasPlan = user.membership_status === 'Premium' && user.plan_type &&
        ['silver', 'gold', 'platinum'].includes(String(user.plan_type).toLowerCase()) &&
        user.plan_validity && new Date(user.plan_validity) > new Date();
      if (!hasPlan) {
        throw new Error('Chat is a premium feature. Please upgrade to a Silver, Gold, or Platinum plan to send messages.');
      }
    }

    const newId = Math.max(...db.messages.map((m) => m.id), 0) + 1;
    const newMsg = {
      id: newId,
      sender_id: currentUserId,
      receiver_id: Number(receiverId),
      message_text: text,
      message_type: type,
      is_read: false,
      call_duration: duration,
      created_at: new Date().toISOString(),
    };
    db.messages.push(newMsg);
    await saveDb(db);
    return newMsg;
  },

  getConversations: async () => {
    await delay();
    const db = await getDb();
    const userMessages = db.messages.filter((m) => m.sender_id === currentUserId || m.receiver_id === currentUserId);
    const partnerIds = Array.from(new Set(userMessages.map((m) => (m.sender_id === currentUserId ? m.receiver_id : m.sender_id))));

    const conversations = partnerIds.map((partnerId) => {
      const partnerProfile = db.profiles.find((p) => p.user_id === partnerId);
      const partnerPhotos = db.photos.filter((p) => p.user_id === partnerId);
      const mainPhoto = partnerPhotos.find((p) => p.is_main) || partnerPhotos[0];

      const conversationMsgs = userMessages
        .filter((m) => (m.sender_id === currentUserId && m.receiver_id === partnerId) || (m.sender_id === partnerId && m.receiver_id === currentUserId))
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      const lastMessage = conversationMsgs[0];
      const unreadCount = conversationMsgs.filter((m) => m.sender_id === partnerId && !m.is_read).length;

      return {
        participant: {
          id: partnerId,
          name: partnerProfile?.name || 'User',
          gender: partnerProfile?.gender || 'Unknown',
          age: partnerProfile?.age || 25,
          photo_url: mainPhoto?.url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          is_online: true,
        },
        last_message: lastMessage,
        unread_count: unreadCount,
      };
    });

    return conversations;
  },

  getMessageHistory: async (participantId: number) => {
    await delay();
    const db = await getDb();
    const history = db.messages
      .filter((m) => (m.sender_id === currentUserId && m.receiver_id === Number(participantId)) || (m.sender_id === Number(participantId) && m.receiver_id === currentUserId))
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    // Mark received messages as read
    history.forEach((m) => {
      if (m.receiver_id === currentUserId) m.is_read = true;
    });
    await saveDb(db);

    return history;
  },

  getInboxMessages: async (type: 'all' | 'chats' | 'requests', _onlineNow: boolean = false) => {
    await delay();
    const conversations = await mockApi.getConversations();
    if (type === 'all') return conversations;
    if (type === 'requests') return conversations.filter((c) => c.last_message?.message_type === 'request');
    return conversations.filter((c) => c.last_message?.message_type === 'chat');
  },

  // Membership & Account
  getMenuSummary: async () => {
    await delay();
    const db = await getDb();
    const user = db.users.find((u) => u.id === currentUserId) || db.users[1];
    const profile = db.profiles.find((p) => p.user_id === currentUserId) || db.profiles[1];

    return {
      name: profile?.name || 'Ahmed Khan',
      user_id: user.id,
      membership_status: user.membership_status,
      plan_type: user.plan_type,
      remaining_contact_views: user.remaining_contact_views,
      remaining_messages: user.remaining_messages,
      remaining_call_time: user.remaining_call_time,
      credits: user.credits,
      plan_validity: user.plan_validity,
      is_expired: user.plan_validity ? new Date(user.plan_validity) < new Date() : false,
      is_plan_active: user.membership_status === 'Premium',
    };
  },

  subscribePlan: async (planType: string) => {
    await delay();
    const db = await getDb();
    const user = db.users.find((u) => u.id === currentUserId);
    if (user) {
      user.membership_status = 'Premium';
      user.plan_type = planType;
      if (planType === 'Platinum') {
        user.remaining_contact_views = 9999;
        user.remaining_messages = 9999;
        user.remaining_call_time = 1000;
        user.credits += 1000;
        user.plan_validity = new Date(Date.now() + 180 * 86400000).toISOString();
      } else if (planType === 'Gold') {
        user.remaining_contact_views = 100;
        user.remaining_messages = 1000;
        user.remaining_call_time = 300;
        user.credits += 500;
        user.plan_validity = new Date(Date.now() + 90 * 86400000).toISOString();
      } else {
        user.remaining_contact_views = 20;
        user.remaining_messages = 200;
        user.remaining_call_time = 60;
        user.credits += 100;
        user.plan_validity = new Date(Date.now() + 30 * 86400000).toISOString();
      }
      await saveDb(db);
    }
    return { message: 'Plan activated successfully!' };
  },

  renewPlan: async () => {
    await delay();
    const db = await getDb();
    const user = db.users.find((u) => u.id === currentUserId);
    if (user && user.plan_type) {
      user.plan_validity = new Date(Date.now() + 90 * 86400000).toISOString();
      await saveDb(db);
    }
    return { message: 'Plan renewed successfully!' };
  },

  submitFeedback: async (rating: number, comment: string) => {
    await delay();
    const db = await getDb();
    db.feedback.push({
      user_id: currentUserId,
      rating,
      comment,
      created_at: new Date().toISOString(),
    });
    await saveDb(db);
    return { message: 'Thank you for your feedback!' };
  },

  getNotifications: async () => {
    await delay();
    return [
      { id: 1, title: 'Interest Accepted 🎉', message: 'Fatima Bi accepted your interest request. You can now chat directly!', time: '2 hours ago', unread: true },
      { id: 2, title: 'Profile Visited 👀', message: 'Zainab Sheikh visited your profile today.', time: '5 hours ago', unread: true },
      { id: 3, title: 'Welcome to HelpMeet ❤️', message: 'Discover your perfect life partner in a safe, halal matrimonial network.', time: '1 day ago', unread: false },
    ];
  },

  getSupport: async () => {
    await delay();
    return {
      support_email: 'support@helpmeet.com',
      hotline: '+91 98765 43210',
      operating_hours: '10 AM to 6 PM (IST)',
      email: 'support@helpmeet.com',
      phone: '+91 98765 43210',
      whatsapp: '+91 98765 43210',
      timings: '10 AM to 6 PM (IST)',
      faq: [
        { question: 'How do I edit my profile?', answer: 'Go to View/Edit profile in the sidebar menu and update any details.' },
        { question: 'What happens when contact views run out?', answer: 'You will need to upgrade/subscribe to Silver, Gold, or Platinum plans to get more views.' }
      ]
    };
  },

  getPaymentConfig: async () => {
    await delay();
    return {
      merchant_upi_id: 'helpmeet.matrimony@upi',
      merchant_name: 'HelpMeet Matrimony Services',
    };
  },

  // Admin Console
  getPendingVerifications: async () => {
    await delay();
    const db = await getDb();
    const pendingDocs = db.users
      .filter((u) => u.id_verification_status === 'Pending')
      .map((u) => {
        const p = db.profiles.find((prof) => prof.user_id === u.id);
        return {
          user_id: u.id,
          name: p?.name || u.email,
          email: u.email,
          document_url: u.id_verification_document_url,
          submitted_at: u.last_active_at,
        };
      });

    const pendingPhotos = db.photos
      .filter((photo) => photo.is_approved === false)
      .map((photo) => {
        const p = db.profiles.find((prof) => prof.user_id === photo.user_id);
        return {
          photo_id: photo.id,
          user_id: photo.user_id,
          name: p?.name || 'User',
          url: photo.url,
        };
      });

    return { documents: pendingDocs, photos: pendingPhotos };
  },

  verifyUserDoc: async (userId: number, action: 'approve' | 'reject') => {
    await delay();
    const db = await getDb();
    const user = db.users.find((u) => u.id === Number(userId));
    if (user) {
      user.id_verification_status = action === 'approve' ? 'Verified' : 'Rejected';
      await saveDb(db);
    }
    return { message: `Document ${action === 'approve' ? 'approved' : 'rejected'}` };
  },

  verifyUserPhoto: async (photoId: number, action: 'approve' | 'reject') => {
    await delay();
    const db = await getDb();
    const photo = db.photos.find((p) => p.id === Number(photoId));
    if (photo) {
      if (action === 'approve') {
        photo.is_approved = true;
      } else {
        db.photos = db.photos.filter((p) => p.id !== Number(photoId));
      }
      await saveDb(db);
    }
    return { message: `Photo ${action === 'approve' ? 'approved' : 'rejected'}` };
  },

  getAdminUsers: async () => {
    await delay();
    const db = await getDb();
    return db.users.map((u) => {
      const p = db.profiles.find((prof) => prof.user_id === u.id);
      return {
        id: u.id,
        email: u.email,
        name: p?.name || 'User',
        is_admin: u.is_admin,
        membership_status: u.membership_status,
        plan_type: u.plan_type,
        id_verification_status: u.id_verification_status,
        created_at: u.last_active_at,
      };
    });
  },

  // Google, OTP & Password Reset
  googleAuth: async (email: string, _google_id: string, name?: string) => {
    await delay();
    const db = await getDb();
    let user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      await mockApi.register(email, 'google_password');
      user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (user && name) {
        const p = db.profiles.find((prof) => prof.user_id === user!.id);
        if (p) p.name = name;
        await saveDb(db);
      }
    }
    return mockApi.login(email);
  },

  sendOTP: async (_phoneNumber: string) => {
    await delay();
    return { message: 'OTP sent successfully to your mobile number.', otp_debug: '123456' };
  },

  verifyOTP: async (phoneNumber: string, otpCode: string) => {
    await delay();
    if (otpCode !== '123456' && otpCode.length !== 6) {
      throw new Error('Invalid OTP code. Please enter 123456');
    }
    const email = `${phoneNumber.replace(/[^0-9]/g, '')}@mobile.matrimony`;
    return mockApi.login(email);
  },

  forgotPassword: async (identifier: string, method: 'email' | 'whatsapp' = 'email') => {
    await delay();
    return {
      message: `Password reset instructions sent via ${method}`,
      reset_token: 'mock_reset_token_889900',
      reset_code_debug: '889900',
    };
  },

  resetPassword: async (identifier: string, resetToken: string, _newPassword: string) => {
    await delay();
    const db = await getDb();
    const user = db.users.find((u) => u.email.toLowerCase() === identifier.toLowerCase() || u.email.includes(identifier));
    if (user) {
      user.password = _newPassword;
      await saveDb(db);
    }
    return { message: 'Password updated successfully' };
  },
};
