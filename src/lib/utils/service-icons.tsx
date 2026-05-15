import {
    Play, Music, Cloud, Pencil, FileText, MessageCircle, Video,
    Square, BookOpen, CheckCircle2, BookMarked, Lock,
    Palette, Brain, Code, DollarSign, Camera, Mail,
    PieChart, BarChart3, TrendingUp, ShoppingBag, Zap,
    HardDrive, Network, Shield, Lightbulb, Search,
    Monitor, Megaphone, MapPin, Gift, AlertCircle, Gamepad2
} from 'lucide-react';

// Simple Icons brand logos for real brand representation
import {
    SiGusto,
    SiUnitedairlines,
    SiStarbucks,
    SiMcdonalds,
    SiUber,
    SiSpotify,
    SiNetflix,
    SiGoogle,
    SiSlack,
    SiGithub,
    SiNotion,
    SiFigma,
    SiCanva,
    SiDropbox,
    SiStripe,
    SiPaypal,
    SiZoom,
    SiAsana,
    SiTrello,
    SiJira,
    SiDiscord,
    SiTelegram,
    SiNordvpn,
    Si1Password,
    SiLastpass,
    SiGrammarly,
    SiGitlab,
    SiBitbucket,
    SiHeroku,
    SiVercel,
    SiNetlify,
    SiDigitalocean,
    SiOpenai,
    SiMailchimp,
    SiHubspot,
    SiSemrush,
    SiMozilla,
    SiMixpanel,
    SiDatadog,
    SiSentry,
    SiGrafana,
    SiDoordash,
    SiUbereats,
    SiSeatgeek,
    SiInstagram,
    SiFacebook,
    SiYoutube,
    SiTiktok,
    SiTwitch,
    SiPatreon,
    SiCoinbase,
    SiX,
} from 'react-icons/si';

import type { ReactNode } from 'react';

type ServiceIcon = ReactNode;

const serviceIconMap: Record<string, () => ServiceIcon> = {
    // Streaming & Entertainment
    netflix: () => <SiNetflix size={20} />,
    spotify: () => <SiSpotify size={20} />,
    'youtube premium': () => <SiYoutube size={20} />,
    youtube: () => <SiYoutube size={20} />,
    twitch: () => <SiTwitch size={20} />,
    tiktok: () => <SiTiktok size={20} />,
    'apple tv': () => <Play size={20} />,
    'disney+': () => <Play size={20} />,
    hulu: () => <Play size={20} />,
    'hbo max': () => <Play size={20} />,
    'paramount+': () => <Play size={20} />,

    // Cloud Storage
    'google drive': () => <SiGoogle size={20} />,
    dropbox: () => <SiDropbox size={20} />,
    'amazon s3': () => <Cloud size={20} />,
    'icloud+': () => <Cloud size={20} />,
    onedrive: () => <Square size={20} />,
    'box storage': () => <Cloud size={20} />,
    backblaze: () => <HardDrive size={20} />,

    // Design & Creative
    figma: () => <SiFigma size={20} />,
    canva: () => <SiCanva size={20} />,
    'adobe creative': () => <Palette size={20} />,
    'adobe photoshop': () => <Palette size={20} />,
    'adobe illustrator': () => <Palette size={20} />,
    'adobe xd': () => <Square size={20} />,
    sketch: () => <Square size={20} />,
    affinity: () => <Palette size={20} />,

    // Productivity & Office
    microsoft: () => <Square size={20} />,
    'microsoft 365': () => <Square size={20} />,
    'office 365': () => <Square size={20} />,
    notion: () => <SiNotion size={20} />,
    asana: () => <SiAsana size={20} />,
    monday: () => <Square size={20} />,
    jira: () => <SiJira size={20} />,
    trello: () => <SiTrello size={20} />,
    todoist: () => <CheckCircle2 size={20} />,
    evernote: () => <BookMarked size={20} />,
    onenote: () => <BookOpen size={20} />,

    // Communication & Collaboration
    slack: () => <SiSlack size={20} />,
    zoom: () => <SiZoom size={20} />,
    teams: () => <Square size={20} />,
    discord: () => <SiDiscord size={20} />,
    telegram: () => <SiTelegram size={20} />,
    skype: () => <Video size={20} />,
    whatsapp: () => <MessageCircle size={20} />,
    intercom: () => <MessageCircle size={20} />,

    // Security & Password Management
    '1password': () => <Si1Password size={20} />,
    lastpass: () => <SiLastpass size={20} />,
    bitwarden: () => <Lock size={20} />,
    dashlane: () => <Lock size={20} />,
    nordvpn: () => <SiNordvpn size={20} />,
    'expressvpn': () => <Shield size={20} />,
    'surfshark': () => <Shield size={20} />,

    // Writing & Content
    grammarly: () => <SiGrammarly size={20} />,
    'hemingway editor': () => <Pencil size={20} />,
    'medium membership': () => <FileText size={20} />,
    substack: () => <Mail size={20} />,
    newsletter: () => <Mail size={20} />,
    patreon: () => <SiPatreon size={20} />,

    // Development & Code
    github: () => <SiGithub size={20} />,
    gitlab: () => <SiGitlab size={20} />,
    bitbucket: () => <SiBitbucket size={20} />,
    heroku: () => <SiHeroku size={20} />,
    vercel: () => <SiVercel size={20} />,
    netlify: () => <SiNetlify size={20} />,
    digitalocean: () => <SiDigitalocean size={20} />,
    aws: () => <Cloud size={20} />,

    // AI & ML
    chatgpt: () => <SiOpenai size={20} />,
    'openai': () => <SiOpenai size={20} />,
    claude: () => <Brain size={20} />,
    gemini: () => <Lightbulb size={20} />,
    copilot: () => <Brain size={20} />,

    // Analytics & Data
    mixpanel: () => <SiMixpanel size={20} />,
    amplitude: () => <BarChart3 size={20} />,
    segment: () => <Network size={20} />,
    hotjar: () => <Monitor size={20} />,
    'google analytics': () => <TrendingUp size={20} />,
    datadog: () => <SiDatadog size={20} />,
    sentry: () => <SiSentry size={20} />,
    grafana: () => <SiGrafana size={20} />,

    // Marketing & SEO
    mailchimp: () => <SiMailchimp size={20} />,
    klaviyo: () => <Mail size={20} />,
    hubspot: () => <SiHubspot size={20} />,
    semrush: () => <SiSemrush size={20} />,
    'ahrefs': () => <Search size={20} />,
    moz: () => <SiMozilla size={20} />,

    // Finance & Payments
    stripe: () => <SiStripe size={20} />,
    paypal: () => <SiPaypal size={20} />,
    square: () => <DollarSign size={20} />,
    wise: () => <DollarSign size={20} />,
    coinbase: () => <SiCoinbase size={20} />,

    // Photo & Video
    'adobe lightroom': () => <Camera size={20} />,
    lightroom: () => <Camera size={20} />,
    shutterstock: () => <Camera size={20} />,
    unsplash: () => <Camera size={20} />,
    pexels: () => <Camera size={20} />,
    loom: () => <Video size={20} />,
    obs: () => <Video size={20} />,

    // Social & Networks
    linkedin: () => <Network size={20} />,
    twitter: () => <SiX size={20} />,
    instagram: () => <SiInstagram size={20} />,
    facebook: () => <SiFacebook size={20} />,
    'apple music': () => <Music size={20} />,
    'amazon prime': () => <ShoppingBag size={20} />,

    // Maps & Travel
    'google maps': () => <MapPin size={20} />,
    'apple maps': () => <MapPin size={20} />,

    // Shopping & Rewards
    amazon: () => <ShoppingBag size={20} />,
    costco: () => <ShoppingBag size={20} />,
    target: () => <Gift size={20} />,

    // Fitness & Health
    peloton: () => <Zap size={20} />,
    'apple fitness': () => <Lightbulb size={20} />,
    calm: () => <Brain size={20} />,
    headspace: () => <Brain size={20} />,

    // Food & Restaurants
    'mcdonald\'s': () => <SiMcdonalds size={20} />,
    mcdonalds: () => <SiMcdonalds size={20} />,
    starbucks: () => <SiStarbucks size={20} />,
    kfc: () => <ShoppingBag size={20} />,
    'fast food': () => <ShoppingBag size={20} />,
    doordash: () => <SiDoordash size={20} />,
    ubereats: () => <SiUbereats size={20} />,
    grubhub: () => <ShoppingBag size={20} />,

    // Travel & Transportation
    'united airlines': () => <SiUnitedairlines size={20} />,
    airline: () => <SiUnitedairlines size={20} />,
    'united': () => <SiUnitedairlines size={20} />,
    uber: () => <SiUber size={20} />,
    seatgeek: () => <SiSeatgeek size={20} />,

    // Payroll & HR
    gusto: () => <SiGusto size={20} />,
    'gusto pay': () => <SiGusto size={20} />,

    // Banking & Payments
    'credit card': () => <DollarSign size={20} />,
    deposit: () => <DollarSign size={20} />,
    ach: () => <DollarSign size={20} />,
    'electronic': () => <DollarSign size={20} />,
    payment: () => <DollarSign size={20} />,
};

export const getServiceIcon = (serviceName: string): ServiceIcon => {
    const normalized = serviceName.toLowerCase().trim();

    // Look for exact match
    if (serviceIconMap[normalized]) {
        return serviceIconMap[normalized]();
    }

    // Look for partial matches
    for (const [key, iconFn] of Object.entries(serviceIconMap)) {
        if (normalized.includes(key) || key.includes(normalized)) {
            return iconFn();
        }
    }

    // No match found, return AlertCircle as fallback
    return <AlertCircle size={20} />;
};
