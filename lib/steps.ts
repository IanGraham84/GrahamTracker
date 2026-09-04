export type StepGroup =
  | "Getting started"
  | "Licensing"
  | "Training"
  | "Contracting"
  | "Business launch"
  | "Go time!";

export type StepLink = { label: string; url: string };
export type Step = {
  id: string;
  name: string;
  group: StepGroup;
  licensedGroup?: StepGroup;
  note?: string;
  links?: StepLink[];
  unlicensedOnly?: boolean;
};

function l(label: string, url: string): StepLink {
  return { label, url };
}

export const STEPS: Step[] = [
  { id: "1", name: "Watch welcome video and create email", group: "Getting started", note: "2 min intro video. Template: firstlast.sfg@gmail.com", links: [l("Watch video", "https://vimeo.com/1223055151/7cdec0cd7a?share=copy&fl=sv&fe=ci#t=0")] },
  { id: "enroll_course", name: 'Enroll in "Life Only" prelicensing course w/ JustInsurance', group: "Getting started", note: "This link does not provide the pre-licensing course for New York residents — reach out to Beth for a separate link.", unlicensedOnly: true, links: [l("Register", "https://getyourinsurancelicense.com/ian-graham")] },
  { id: "schedule_call_beth", name: "Schedule onboarding call with Beth", group: "Getting started", note: "Beth will text you the link to schedule." },
  { id: "2", name: "Pass state exam", group: "Licensing", unlicensedOnly: true },
  { id: "3", name: "Fingerprints done and submitted (if required)", group: "Licensing", note: "See state licensing requirements", unlicensedOnly: true, links: [l("State Requirements", "https://docs.google.com/document/d/1O3wmlDe9VLMu3jMmEO5OIrRPXfLvApSIt_GqcRLZnxE/edit?tab=t.0")] },
  { id: "4", name: "Apply for state licensure", group: "Licensing", unlicensedOnly: true, links: [l("Apply at NIPR", "https://nipr.com/")] },
  { id: "license_received", name: "Full license received", group: "Licensing", note: "Admin or agent confirms", unlicensedOnly: true },
  { id: "5", name: "Confirm you're in agency Slack chats", group: "Getting started", links: [l("Join Slack", "https://thedelaneyagency.slack.com/join/shared_invite/zt-44qczj4wk-gbvwMMaz_CXJENGx8l5phw#/shared-invite/email")] },
  { id: "6", name: "Add weekly calls to calendar", group: "Getting started", links: [l("View calendar", "https://www.canva.com/design/DAGyzALSGCc/u_rINYIrKpjLiUsF8F81Uw/view?utm_content=DAGyzALSGCc&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h3621a1f017")] },
  { id: "engage_conference", name: "Add Engage 2026 Conference to calendar and purchase ticket", group: "Getting started", note: "September 23-25. Reach out to your mentor for a discount code to drop the cost from $299 to $219.", links: [l("Register", "https://www.quilityevents.com/event/engage26/home")] },
  { id: "orientation_call", name: "Attend New Agent Orientation Call", group: "Getting started", note: "Every Tuesday at 12 PM EST. You only need to attend once. Password: Maddox", links: [l("Join Zoom", "https://us06web.zoom.us/j/7276511923?pwd=6IaXf6dGH3x5Kwf8hLRyUsOjOQogpe.1"), l("Levels of Leadership", "https://hq.quility.com/cms/document/view/44534"), l("Promo Guidelines", "https://hq.quility.com/page/promotion-guidelines-and-bonuses"), l("Core Values", "https://hq.quility.com/page/symmetry-core-values"), l("4 Keys", "https://hq.quility.com/api/public/document/57508/view/four-keys-successful-week"), l("4 Cornerstones", "https://hq.quility.com/api/public/document/62330/view/four-cornerstones-of-success")] },
  { id: "9a", name: "Open separate banking account for insurance deposits", group: "Getting started" },
  { id: "onboarding_login", name: "Create login to onboarding portal", group: "Getting started", note: "Use your new work email and create a password — stop there for now.", links: [l("Open portal", "http://www.quilityonboarding.com/")], unlicensedOnly: true },
  { id: "course_done", name: "Finished 20-hour pre-licensing course", group: "Getting started", note: "Agent OR admin can check.", unlicensedOnly: true },
  { id: "7", name: "Complete SFG Application", group: "Licensing", licensedGroup: "Getting started", note: "Approval 24-48 hrs.", links: [l("Open application", "http://www.quilityonboarding.com/")] },
  { id: "10", name: "Complete Anti-Money Laundering (AML) course", group: "Contracting", links: [l("AML course", "https://www.webce.com/quility/catalog/courses/course-information/aml-training/course/237297")] },
  { id: "leake", name: "Enrolled in Leake Agency Mortgage Protection Sales Mastery", group: "Training", note: "$25. Get through Module 8.", links: [l("Purchase training", "https://training.theleakeagency.com/p/effective-mortgage-protection-sales?affcode=1444119_bbt65tue")] },
  { id: "quigley", name: "Role Play Appointment Setting with Quigley", group: "Training", note: "Choose your upline and they'll be able to see your progress and help coach. Practice 25 new mortgage holders and 25 aged leads.", links: [l("Open Quigley", "https://quigley.momentousfinancialpartners.com/sign-in")] },
  { id: "11", name: "Received 'Welcome to Symmetry' email", group: "Contracting" },
  { id: "12", name: "Create SureLC account", group: "Contracting", note: "Step 3 in welcome email. No red/yellow flags." },
  { id: "13", name: "Purchase E&O Insurance and upload to SureLC", group: "Contracting", note: "Min $1M coverage. Click 'Other industries', type 'insurance agent', DBA is your name, enter address manually, coverage starts today, 0 employees, $75k expected income, select 'Life and Health', individual agent. Remove general liability from cart — total should be $21/mo.", links: [l("Get E&O Insurance", "https://refer.nextinsurance.com/AdqS82x")] },
  { id: "14", name: "Notify hiring agent and ops manager when SureLC complete", group: "Contracting", note: "Can take up to 2 weeks for writing numbers" },
  { id: "15", name: "Log into OPT and update password", group: "Contracting", note: "OPT ID is found in HQ profile, premium version not needed", links: [l("Open OPT", "https://v2.sfgcrm.com/")] },
  { id: "17", name: "Complete SureLC carrier contracts", group: "Contracting", note: "No LTC or annuity training needed" },
  { id: "uhl_contract", name: "Complete UHL carrier contract (United Home Life)", group: "Contracting", note: "UHL is not available in SureLC — it's sent directly to your SFG email from producerexpress@sircon.com." },
  { id: "18", name: "As carrier appointments arrive — save all login info", group: "Contracting", note: "Americo, F&G, UHL, Foresters, SBLI, Corebridge, American Amicable, Banner, Mutual of Omaha, Transamerica" },
  { id: "19", name: "HQ Summit; Fast start through Basecamp", group: "Training", note: "~3-4 hours", links: [l("Open Summit", "https://hq.quility.com/summit")] },
  { id: "20", name: "Complete Funnel, Navigator, and LeadStream training", group: "Training", note: "Log into HQ and use the top left 9-dot menu to go to QU LMS, and watch the trainings for all 3 Quility Tech Platforms.", links: [l("Watch walkthrough", "https://www.loom.com/share/ae8b5889c0384620a07ea2b14dac6cd1?sid=976049f6-790c-4521-bf8d-139203188e7a")] },
  { id: "21", name: "Get in the workroom and listen to live dialing", group: "Training", note: "Password: grit", links: [l("Join Zoom", "https://us02web.zoom.us/j/84536103772?pwd=ccneAyVfOtOaKcbbmeX8iPfSKUVrug.1")] },
  { id: "flat_tire_video", name: "Watch the Flat Tire List video", group: "Business launch", links: [l("Watch video", "https://vimeo.com/user181470649/flattirelist?share=copy")] },
  { id: "flat_tire", name: "Flat Tire Appointments", group: "Business launch", links: [l("Flat Tire Script", "https://drive.google.com/file/d/1785rgWe9uSYXPXL2j_GTGghNBjWH5m3N/view?usp=sharing"), l("Flat Tire CQF", "https://www.canva.com/design/DAHBgO-bcOQ/KCrGToT4qlrXEkESbeMBtA/edit?utm_content=DAHBgO-bcOQ&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton")] },
  { id: "33", name: "Watch Underwriting Basics video", group: "Business launch", note: "Take notes while watching — this is the foundation of all your underwriting/prepping for appointments.", links: [l("Watch video", "https://vimeo.com/1158195241/043694ad86?share=copy&fl=sv&fe=ci")] },
  { id: "cqf_game_plan", name: "Game plan your 10 CQF's w/ your mentor", group: "Business launch", note: "Schedule a meeting with your mentor to game plan your 10+ completed Flat Tire CQF's." },
  { id: "lead_journey", name: "Watch the Lead Journey & Phone Training video", group: "Business launch", links: [l("Watch video", "https://vimeo.com/1201168687/68fb3706d1?share=copy&fl=sv&fe=ci")] },
  { id: "26", name: "Purchase first set of leads (50 CIB's, 50 CIC's)", group: "Business launch", links: [l("Watch tutorial", "https://hq.quility.com/summit/first-lead-order"), l("Lead tracker", "https://docs.google.com/spreadsheets/d/1KOwljBH41JKIB9HRR-XU7QVQXH9k_ZHJ1TnkxiN3smA/edit?gid=0#gid=0")] },
  { id: "first_dials_docs", name: "Save/Print Documents for First Dials", group: "Business launch", links: [l("Bonus Script Modeled", "https://www.loom.com/share/917f78ace0ee42fe9d362459f51f6730"), l("Bonus Lead SCRIPT (opening paragraph)", "https://docs.google.com/document/d/1cnmFLDfX0KaG3rENWp-zdsRr6BnU5lR-/edit?usp=sharing&ouid=116442375128958332146&rtpof=true&sd=true")] },
  { id: "activity_report", name: "Print/Save Activity Report", group: "Business launch", note: "Track your dials, contacts, and appointments to put into SimplicityAI.", links: [l("Open Activity Report", "https://drive.google.com/file/d/1WHS4Q4Gy_Hn_IkQhp20CMRjJtatl_ve6/view?usp=sharing")] },
  { id: "30", name: "Learn how to use the Counting What Counts tracker", group: "Business launch", note: "Winners are trackers — learn to use the CWC tabs to begin tracking your numbers.", links: [l("Watch tutorial", "https://vimeo.com/1203075221?share=copy&fl=sv&fe=ci")] },
  { id: "31", name: "Get in the Zoom Workroom and start dialing", group: "Go time!", note: "Password: grit", links: [l("Join Zoom", "https://us02web.zoom.us/j/84536103772?pwd=ccneAyVfOtOaKcbbmeX8iPfSKUVrug.1")] },
  { id: "16", name: "Write first application and submit to OPT", group: "Go time!", note: "Triggers funnel stage: Wrote first business", links: [l("Watch tutorial", "https://www.loom.com/share/6674330eb81f4f32ba8fb23aa4bd25d4")] },
];

export const STEP_GROUPS: StepGroup[] = [
  "Getting started",
  "Licensing",
  "Training",
  "Contracting",
  "Business launch",
  "Go time!",
];

export function stepsForAgent(type: "licensed" | "unlicensed"): Step[] {
  const steps = STEPS.filter((s) => !s.unlicensedOnly || type === "unlicensed");
  if (type === "licensed") {
    return steps.map((s) =>
      s.licensedGroup ? { ...s, group: s.licensedGroup } : s
    );
  }
  return steps;
}
