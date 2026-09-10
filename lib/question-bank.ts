import { expandedRoleQuestions } from "@/lib/expanded-role-questions";
import {
  candidateRoles,
  familyForRole,
  isCandidateRole,
  positionForRole,
  restaurantConceptById,
  roleLabels,
  type AssessmentProfile,
  type CandidateRole,
  type ExperienceLevel,
  type JobFamilyId,
  type RestaurantConceptId,
} from "@/lib/industry-catalog";

export {
  candidateRoles,
  isCandidateRole,
  roleLabels,
  type CandidateRole,
} from "@/lib/industry-catalog";

export type QuestionCategory =
  | "work_style"
  | "communication"
  | "problem_solving"
  | "technical";

type ScoredChoice = readonly [text: string, points: number];

export type AssessmentQuestion = {
  id: string;
  category: QuestionCategory;
  prompt: string;
  options: Array<{ id: string; text: string; points: number }>;
  reviewNote: string;
  sourceQuestionId?: string;
  contextLead?: QuestionContextLead;
  assessmentProfile?: AssessmentProfile;
  restaurantTags?: string[];
};

export type PublicQuestion = Omit<AssessmentQuestion, "reviewNote" | "options"> & {
  options: Array<{ id: string; text: string }>;
};

export type AssessmentSelection = {
  restaurantConcept: RestaurantConceptId;
  jobFamily: JobFamilyId;
  experienceLevel: ExperienceLevel;
  seed: string;
};

export type QuestionContextLead =
  | "opening_preparation"
  | "peak_service"
  | "shift_handoff"
  | "closing_duties"
  | "full_service"
  | "fine_dining"
  | "counter_service"
  | "off_premise"
  | "buffet_service"
  | "bar_service"
  | "seafood_service"
  | "seafood_boil"
  | "steakhouse_service"
  | "barbecue_service"
  | "sushi_service"
  | "hibachi_show"
  | "hibachi_express"
  | "asian_kitchen"
  | "breakfast_service"
  | "event_service"
  | "entry_supervised"
  | "experienced_peak"
  | "lead_quality";

const q = (
  id: string,
  category: QuestionCategory,
  prompt: string,
  choices: readonly ScoredChoice[],
  reviewNote: string,
): AssessmentQuestion => ({
  id,
  category,
  prompt,
  options: choices.map(([text, points], index) => ({
    id: `${id}-${String.fromCharCode(97 + index)}`,
    text,
    points,
  })),
  reviewNote,
});

const workStyle: AssessmentQuestion[] = [
  q("WS01", "work_style", "You notice that you entered one item incorrectly after the guest has already paid. What do you do?", [
    ["Tell the manager immediately and help correct the record.", 3],
    ["Wait to see whether the guest notices.", 0],
    ["Delete or change the record without telling anyone.", 0],
    ["Ask a coworker to handle it so your name is not involved.", 1],
  ], "Looks for ownership, honesty, and prompt escalation."),
  q("WS02", "work_style", "Your shift begins at 10:00 AM and traffic may make you late. What is the best response?", [
    ["Arrive whenever possible and explain afterward.", 1],
    ["Contact the manager as soon as possible and give an honest arrival estimate.", 3],
    ["Ask a coworker to clock in for you.", 0],
    ["Do not say anything unless the manager calls.", 0],
  ], "Looks for punctuality, communication, and respect for timekeeping rules."),
  q("WS03", "work_style", "A coworker says you can clock out, but the Manager on Duty has not released you. What should you do?", [
    ["Clock out because the coworker has worked there longer.", 0],
    ["Leave quietly if your section is slow.", 0],
    ["Confirm with the Manager on Duty before clocking out.", 3],
    ["Stay clocked in but leave the building.", 0],
  ], "Checks willingness to follow the chain of command and timekeeping policy."),
  q("WS04", "work_style", "You finish your assigned work while the restaurant is still busy. What is the strongest next step?", [
    ["Use your phone until someone gives you another task.", 0],
    ["Leave your station to talk with friends.", 0],
    ["Ask the manager or team where help is most needed.", 3],
    ["Redo only the easiest task so you look busy.", 1],
  ], "Measures initiative that stays within operational direction."),
  q("WS05", "work_style", "A manager gives you corrective feedback in the middle of a shift. How do you respond?", [
    ["Listen, clarify what good performance looks like, and apply it.", 3],
    ["Argue immediately so coworkers know your side.", 0],
    ["Ignore it unless the manager writes you up.", 0],
    ["Say yes, but continue doing it your own way.", 1],
  ], "Looks for coachability and professional self-control."),
  q("WS06", "work_style", "You realize a closing task was missed after you signed that it was complete. What do you do?", [
    ["Correct it and tell the person responsible for verification.", 3],
    ["Leave because the form is already signed.", 0],
    ["Blame the person who checked it.", 0],
    ["Hide the area so it is less noticeable.", 0],
  ], "Looks for integrity and follow-through."),
  q("WS07", "work_style", "A teammate is falling behind during a rush while your own guests are stable. What is best?", [
    ["Help briefly after communicating, while continuing to protect your own responsibilities.", 3],
    ["Take over everything without telling anyone.", 1],
    ["Ignore them because it is not your section.", 0],
    ["Complain about them to other coworkers.", 0],
  ], "Measures balanced teamwork and situational awareness."),
  q("WS08", "work_style", "You are unsure whether a requested action is allowed by restaurant policy. What do you do?", [
    ["Guess based on what seems easiest.", 0],
    ["Ask the Manager on Duty before taking the action.", 3],
    ["Tell the guest that every request is allowed.", 0],
    ["Ask several coworkers and follow the most popular answer.", 1],
  ], "Checks policy discipline and escalation judgment."),
  q("WS09", "work_style", "Your cash count is short at the end of a shift. What is your first response?", [
    ["Add your own money so nobody finds out.", 0],
    ["Change a transaction to make the total match.", 0],
    ["Report the difference and recount with the authorized manager.", 3],
    ["Assume another employee took it.", 0],
  ], "Looks for accurate reporting and protection of financial records."),
  q("WS10", "work_style", "A friend visits while you are working and wants you to sit with them. What should you do?", [
    ["Sit for a few minutes because the restaurant is not full.", 0],
    ["Greet them briefly, then remain on duty and focused on guests.", 3],
    ["Ask a coworker to cover you without manager approval.", 1],
    ["Ignore all guests until your friend leaves.", 0],
  ], "Checks boundaries and focus while on duty."),
  q("WS11", "work_style", "You hear private information about a guest or employee. What is the professional response?", [
    ["Share it only with close coworkers.", 0],
    ["Post a vague version online without names.", 0],
    ["Keep it private and report only through the proper manager channel if necessary.", 3],
    ["Use it as a joke after the shift.", 0],
  ], "Looks for discretion and responsible escalation."),
  q("WS12", "work_style", "Which statement best describes dependable performance?", [
    ["Following standards only when a manager is watching.", 0],
    ["Working quickly even when accuracy suffers.", 1],
    ["Doing the required work consistently, accurately, and communicating problems early.", 3],
    ["Avoiding questions so you appear experienced.", 0],
  ], "Measures understanding of reliability in restaurant operations."),
];

const communication: AssessmentQuestion[] = [
  q("CM01", "communication", "A guest approaches while you are finishing another task. What is the best greeting?", [
    ["Wait silently until the task is finished.", 0],
    ["Acknowledge the guest promptly, welcome them, and explain that you will assist them in a moment.", 3],
    ["Point toward another employee without speaking.", 0],
    ["Say, ‘You need to wait.’", 0],
  ], "Checks prompt acknowledgment and welcoming language."),
  q("CM02", "communication", "You do not understand part of a guest’s request. What should you say?", [
    ["Pretend you understood and enter the most likely choice.", 0],
    ["‘Can you repeat that?’ in an annoyed tone.", 1],
    ["Politely repeat what you understood and ask the guest to clarify the missing detail.", 3],
    ["Tell the guest to speak to someone else.", 0],
  ], "Looks for respectful clarification without guessing."),
  q("CM03", "communication", "A guest mentions a food allergy. What is the strongest communication response?", [
    ["Promise that the meal will be completely allergen-free.", 0],
    ["Acknowledge it, document it accurately, and notify the server/manager/kitchen according to procedure.", 3],
    ["Say that most menu items should be fine.", 0],
    ["Tell the guest to search the menu online.", 0],
  ], "Checks accurate allergy communication without making unsupported guarantees."),
  q("CM04", "communication", "You hand a task to another employee at shift change. What information matters most?", [
    ["Only that you are leaving.", 0],
    ["Open guest needs, payment status, timing, special requests, and any manager involvement.", 3],
    ["Personal opinions about the guests.", 0],
    ["Nothing; the next employee can figure it out.", 0],
  ], "Measures complete, factual handoff communication."),
  q("CM05", "communication", "The phone rings while guests are waiting in front of you. What is best?", [
    ["Ignore everyone until the phone stops.", 0],
    ["Acknowledge the in-person guests, answer according to restaurant procedure, and ask for help if needed.", 3],
    ["Answer and place the caller on hold without speaking.", 0],
    ["Tell the caller the restaurant is too busy and hang up.", 0],
  ], "Checks prioritization and courteous communication across channels."),
  q("CM06", "communication", "A quoted 20-minute wait is now closer to 35 minutes. What should you tell the guest?", [
    ["Nothing unless they ask.", 0],
    ["Give an honest update, apologize for the change, and offer the available next steps.", 3],
    ["Say a table will be ready in five minutes even if you are unsure.", 0],
    ["Blame the servers for being slow.", 0],
  ], "Looks for honest expectation-setting and ownership."),
  q("CM07", "communication", "A guest raises their voice about a mistake. What tone should you use?", [
    ["Match their volume so they know you are serious.", 0],
    ["Calm, respectful, and focused on facts and next steps.", 3],
    ["Sarcastic, because the mistake was small.", 0],
    ["Silent, while walking away without explanation.", 0],
  ], "Measures de-escalating verbal communication."),
  q("CM08", "communication", "A manager’s instruction is unclear during a rush. What is the best response?", [
    ["Repeat the key instruction back and ask one short clarifying question.", 3],
    ["Do whatever you normally do.", 1],
    ["Wait until the rush is over without acting.", 0],
    ["Ask a guest what they think the manager meant.", 0],
  ], "Checks concise closed-loop communication."),
  q("CM09", "communication", "Which message is most professional when updating a waiting guest?", [
    ["‘Still waiting. Nothing I can do.’", 0],
    ["‘Your table is not ready yet. I’m sorry for the delay; I’ll update you again in about ten minutes.’", 3],
    ["‘The kitchen is a mess today.’", 0],
    ["‘You should have made a reservation.’", 0],
  ], "Assesses clear, courteous, and accountable wording."),
  q("CM10", "communication", "A coworker makes a mistake that affects your guest. How should you discuss it?", [
    ["Correct the guest’s experience first, then discuss the facts privately with the coworker or manager.", 3],
    ["Criticize the coworker in front of the guest.", 0],
    ["Tell the guest the coworker is always careless.", 0],
    ["Post about the incident in the team chat with jokes.", 0],
  ], "Looks for respectful internal communication and guest-focused recovery."),
];

const problemSolving: AssessmentQuestion[] = [
  q("PS01", "problem_solving", "A guest says the wait is much longer than promised. What should you do first?", [
    ["Explain that every restaurant gets busy.", 0],
    ["Listen, verify their place/status, apologize, and give an honest updated option.", 3],
    ["Move them ahead of everyone without approval.", 1],
    ["Avoid the guest until a table opens.", 0],
  ], "Checks verification, empathy, fairness, and realistic options."),
  q("PS02", "problem_solving", "A guest receives the wrong entrée. What is the best immediate response?", [
    ["Argue that the POS shows what they ordered.", 0],
    ["Remove it without saying anything.", 1],
    ["Acknowledge the problem, confirm the correct item, notify the right team members, and update the guest.", 3],
    ["Tell the guest to eat it while the kitchen decides.", 0],
  ], "Looks for ownership, correction, and communication."),
  q("PS03", "problem_solving", "A guest’s phone shows an Apple Pay charge as pending, but the restaurant terminal shows declined. What should you do?", [
    ["Treat the phone screen as proof of payment.", 0],
    ["Rely on the restaurant terminal status, explain that pending is not approval, and request another payment method or manager help.", 3],
    ["Run the same payment repeatedly without asking.", 0],
    ["Give cash back for the pending amount.", 0],
  ], "Checks payment-status verification and escalation."),
  q("PS04", "problem_solving", "A drink spills near a walkway during a rush. What is the best sequence?", [
    ["Finish all current tasks before dealing with it.", 0],
    ["Guard or mark the hazard, get help, clean it promptly, and check affected guests.", 3],
    ["Place a napkin over it and walk away.", 1],
    ["Wait for the closing team.", 0],
  ], "Measures immediate safety control and guest care."),
  q("PS05", "problem_solving", "A guest reports an allergy concern after food has been delivered. What should you do?", [
    ["Tell them to remove the ingredient themselves.", 0],
    ["Stop service of the item, notify the manager and kitchen immediately, and follow the allergy procedure.", 3],
    ["Say the amount is probably too small to matter.", 0],
    ["Offer dessert first.", 0],
  ], "Checks urgent escalation of a food-safety concern."),
  q("PS06", "problem_solving", "A guest says they left a wallet at the restaurant yesterday. What is best?", [
    ["Describe every wallet in lost-and-found over the phone.", 0],
    ["Verify identifying details without revealing stored items, then follow manager/lost-and-found procedure.", 3],
    ["Let the caller enter the employee area to search.", 0],
    ["Give them the first similar wallet.", 0],
  ], "Looks for verification and protection of guest property."),
  q("PS07", "problem_solving", "Two parties appear to have the same reservation time and name. What should you do?", [
    ["Choose the party that complains louder.", 0],
    ["Check phone number, party size, notes, and timestamps; involve the manager if the conflict remains.", 3],
    ["Cancel both reservations.", 0],
    ["Seat both at one table without asking.", 0],
  ], "Checks fact-finding before resolution."),
  q("PS08", "problem_solving", "A delivery customer calls because one item is missing. What is best?", [
    ["Say the driver is always responsible.", 0],
    ["Verify the order and missing item, document the issue, and follow the manager-approved remake/refund process.", 3],
    ["Promise an immediate cash refund regardless of payment channel.", 0],
    ["End the call because the order already left.", 0],
  ], "Measures verification and correct-channel recovery."),
  q("PS09", "problem_solving", "A regular guest asks to skip a waitlist with several parties ahead. What is the best response?", [
    ["Move them to the front to keep them happy.", 0],
    ["Apply the same seating policy fairly and ask a manager about any approved exception.", 3],
    ["Tell the waiting parties that regulars are more important.", 0],
    ["Delete the regular guest from the list.", 0],
  ], "Checks fairness and appropriate escalation."),
  q("PS10", "problem_solving", "You find broken glass near a food or drink service area. What should you do?", [
    ["Pick up the largest pieces and continue service.", 1],
    ["Stop use of the affected area, protect guests, notify the team, and follow the full cleanup/replacement procedure.", 3],
    ["Push the glass under equipment until closing.", 0],
    ["Ask a guest to avoid the area.", 0],
  ], "Checks containment, communication, and complete safety response."),
];

const hostCashier: AssessmentQuestion[] = [
  q("HC01", "technical", "A guest requests a specific open table outside the normal server rotation. What should the host do?", [
    ["Refuse every table request so rotation never changes.", 0],
    ["Honor the request when operationally available, update the board/rotation correctly, and communicate with the affected server.", 3],
    ["Seat the table without updating anyone.", 1],
    ["Tell the guest to choose any table themselves.", 0],
  ], "Tests guest preference handling while preserving floor control."),
  q("HC02", "technical", "Before seating a table marked clean, what should the host verify?", [
    ["Only that chairs are present.", 1],
    ["That the table is actually clean, ready, correctly assigned, and appropriate for the party size.", 3],
    ["That the previous guest has paid, even if the table is still dirty.", 0],
    ["Nothing; the board is always perfect.", 0],
  ], "Checks physical verification instead of relying only on status."),
  q("HC03", "technical", "How should a host quote a wait time?", [
    ["Promise the shortest possible time.", 0],
    ["Use current table status and manager guidance, give a realistic estimate, and explain that it may change.", 3],
    ["Double every estimate to be safe.", 1],
    ["Never give any estimate.", 0],
  ], "Tests realistic wait management."),
  q("HC04", "technical", "A party changes from four guests to seven while waiting. What should the host do?", [
    ["Keep the same plan without updating the list.", 0],
    ["Update the party size, explain any wait impact, and find an appropriate table plan.", 3],
    ["Seat four now and make three stand nearby.", 0],
    ["Delete the party and make them start over without explanation.", 0],
  ], "Checks accurate waitlist and capacity management."),
  q("HC05", "technical", "What is the safest way to take a phone order?", [
    ["Enter it quickly without repeating it.", 0],
    ["Confirm name, callback number, items, modifiers, pickup time, and read the order back.", 3],
    ["Ask the caller to remember their total.", 1],
    ["Use your personal phone to text the kitchen.", 0],
  ], "Tests complete order capture and verification."),
  q("HC06", "technical", "A guest pays cash with a $100 bill. What should the cashier do?", [
    ["Put the bill in the drawer before entering the amount.", 1],
    ["Follow the bill-check policy, state the amount received, enter it accurately, and count change back.", 3],
    ["Ask the guest to calculate their own change.", 0],
    ["Leave the drawer open while helping another guest.", 0],
  ], "Checks cash-control sequence and accuracy."),
  q("HC07", "technical", "When is a card payment complete?", [
    ["When the guest says their bank sent a notification.", 0],
    ["When the restaurant terminal/POS confirms approval and the check is closed correctly.", 3],
    ["When the card is inserted.", 0],
    ["When a receipt starts printing, even if it says declined.", 0],
  ], "Tests payment approval verification."),
  q("HC08", "technical", "Under the restaurant’s DoorDash pickup procedure, when may the order be handed to the Dasher?", [
    ["As soon as the Dasher says the customer’s first name.", 0],
    ["After the Dasher takes the required photo, confirms pickup in the app, shows confirmation, and the order disappears from the DoorDash tablet.", 3],
    ["After the Dasher promises to confirm outside.", 0],
    ["Whenever the lobby becomes busy.", 0],
  ], "Tests the restaurant’s required delivery handoff controls."),
  q("HC09", "technical", "The name on a delivery driver’s phone does not match any ready order. What should the cashier do?", [
    ["Give the closest matching order.", 0],
    ["Verify the platform, order number, customer name, and items; ask a manager if it still does not match.", 3],
    ["Let the driver search through the bags.", 0],
    ["Mark every order picked up.", 0],
  ], "Checks order identity verification."),
  q("HC10", "technical", "What information should be recorded for a reservation?", [
    ["Name only.", 1],
    ["Name, phone number, date/time, party size, and relevant approved notes.", 3],
    ["A photo of the guest’s ID.", 0],
    ["The guest’s social media account.", 0],
  ], "Tests necessary and proportionate reservation details."),
  q("HC11", "technical", "A server asks the host to stop seating their section during a rush. What should the host do?", [
    ["Stop immediately without checking.", 1],
    ["Confirm with the Manager on Duty and update the floor system if approved.", 3],
    ["Keep seating faster to test the server.", 0],
    ["Move the server’s tables to another name secretly.", 0],
  ], "Checks manager-controlled floor changes."),
  q("HC12", "technical", "A table has paid but guests are still seated. What status should the host use?", [
    ["Ready, because payment is complete.", 0],
    ["Occupied until guests leave; then dirty/clean according to the actual table condition.", 3],
    ["Reserved for the next party.", 0],
    ["Remove the table from the floor map.", 0],
  ], "Tests accurate table-state management."),
  q("HC13", "technical", "What is the best way to protect card information?", [
    ["Write the full card number on a note for later.", 0],
    ["Use only approved payment equipment and never photograph, copy, or share card data.", 3],
    ["Read the card number aloud to confirm it.", 0],
    ["Save it in a personal phone contact.", 0],
  ], "Checks payment-data handling."),
  q("HC14", "technical", "Your drawer total does not match the POS. What should happen next?", [
    ["Recount with the authorized manager and review transactions without altering records improperly.", 3],
    ["Delete cash sales until it matches.", 0],
    ["Split the shortage among coworkers.", 0],
    ["Take money from the tip jar temporarily.", 0],
  ], "Tests cash reconciliation integrity."),
  q("HC15", "technical", "A guest presents a discount you do not recognize. What should the cashier do?", [
    ["Apply any discount to avoid conflict.", 0],
    ["Verify the offer and obtain manager approval before changing the check.", 3],
    ["Tell the guest it is fake.", 0],
    ["Use another employee’s manager code.", 0],
  ], "Checks authorization controls."),
  q("HC16", "technical", "Before giving a takeout order to a guest, what should be checked?", [
    ["Only the number of bags.", 1],
    ["Guest/order identity, item checklist, sauces/sides, payment status, and sealed packaging as required.", 3],
    ["Whether the guest tips first.", 0],
    ["Nothing if the kitchen tied the bag.", 0],
  ], "Tests complete takeout handoff."),
  q("HC17", "technical", "At the end of the shift, who determines whether an employee may clock out?", [
    ["Any coworker in the same position.", 0],
    ["The Manager on Duty after required work is complete.", 3],
    ["The employee’s family member.", 0],
    ["The last guest to leave.", 0],
  ], "Tests the restaurant’s timekeeping chain of command."),
  q("HC18", "technical", "You see another person trying to use a manager login or code. What should you do?", [
    ["Help if they say it is urgent.", 0],
    ["Do not share or enter the credential; notify the authorized manager.", 3],
    ["Post the code near the register for the team.", 0],
    ["Use the account and sign the manager’s name.", 0],
  ], "Checks access-control awareness."),
];

const serverQuestions: AssessmentQuestion[] = [
  q("SV01", "technical", "What should happen shortly after guests are seated?", [
    ["Wait until they wave for help.", 0],
    ["Greet them promptly, introduce the service, and address initial drink/menu needs.", 3],
    ["Drop the check immediately.", 0],
    ["Ask them to order everything before receiving water.", 1],
  ], "Tests a prompt, organized opening step of service."),
  q("SV02", "technical", "A guest states they have a shellfish allergy. What should the server do?", [
    ["Recommend removing visible shellfish only.", 0],
    ["Clearly document and communicate the allergy to the manager and kitchen, and avoid guaranteeing zero cross-contact.", 3],
    ["Say seafood restaurants cannot help with allergies.", 0],
    ["Ask another guest at the table to decide.", 0],
  ], "Checks allergy escalation and careful language."),
  q("SV03", "technical", "Before sending a complex order, what is best?", [
    ["Read it back, verify seat numbers, temperatures, sides, sauces, and allergy notes.", 3],
    ["Send it quickly and fix details later.", 0],
    ["Memorize it without writing or entering it.", 1],
    ["Ask the kitchen to call the guest.", 0],
  ], "Tests order accuracy."),
  q("SV04", "technical", "Why are seat numbers useful?", [
    ["They help deliver items accurately and support correct split checks.", 3],
    ["They decide which guest should tip most.", 0],
    ["They replace the need to confirm orders.", 1],
    ["They are used only for large parties.", 0],
  ], "Checks organized table service."),
  q("SV05", "technical", "When should a server check back after food is delivered?", [
    ["Promptly after guests have had a chance to inspect/taste, without interrupting excessively.", 3],
    ["Only when presenting the check.", 0],
    ["Every minute until they answer.", 1],
    ["Never; runners are responsible.", 0],
  ], "Tests timely quality checks."),
  q("SV06", "technical", "A guest ordering alcohol appears young and does not have acceptable ID. What should the server do?", [
    ["Serve one drink if their friend confirms their age.", 0],
    ["Do not serve; follow current ID policy and involve the manager.", 3],
    ["Accept a photo of any ID automatically.", 0],
    ["Serve food first, then alcohol without checking again.", 0],
  ], "Checks alcohol-ID compliance without guessing."),
  q("SV07", "technical", "A guest appears intoxicated and requests another alcoholic drink. What is best?", [
    ["Serve it because refusing may reduce the tip.", 0],
    ["Pause service, notify the bartender/manager, and follow responsible-service procedure.", 3],
    ["Bring two waters and the drink.", 0],
    ["Ask another guest to order it for them.", 0],
  ], "Checks escalation for responsible alcohol service."),
  q("SV08", "technical", "What is the purpose of pre-bussing?", [
    ["To remove needed items as fast as possible.", 0],
    ["To keep the table comfortable and organized by removing finished items at appropriate times.", 3],
    ["To signal that guests must leave.", 0],
    ["To avoid checking on the table.", 0],
  ], "Tests table maintenance and guest awareness."),
  q("SV09", "technical", "Which is the best approach to suggesting an appetizer?", [
    ["Describe a relevant option and let the guest decide without pressure.", 3],
    ["Add it to the order unless the guest objects.", 0],
    ["Tell the guest the manager requires it.", 0],
    ["Recommend only the most expensive item.", 1],
  ], "Checks accurate, guest-centered recommendation."),
  q("SV10", "technical", "Entrées are ready, but the table has not received an ordered appetizer. What should the server do?", [
    ["Deliver everything without explanation.", 1],
    ["Coordinate with the kitchen/manager, protect food quality, and explain the correction to the guest.", 3],
    ["Cancel the appetizer without telling anyone.", 0],
    ["Blame the food runner at the table.", 0],
  ], "Tests coursing recovery and communication."),
  q("SV11", "technical", "A guest requests ‘no seasoning’ on one item. How should it be entered?", [
    ["As a clear modifier on the correct item, confirmed verbally if the kitchen requires it.", 3],
    ["In a note on a different seat.", 0],
    ["Not entered because the kitchen will remember.", 0],
    ["As an allergy even if the guest did not identify one.", 1],
  ], "Checks precise POS modifiers."),
  q("SV12", "technical", "A table asks for separate checks after ordering. What is best?", [
    ["Refuse automatically.", 0],
    ["Clarify how to split, use seat/order records, and explain any actual system limitation early.", 3],
    ["Guess which items belong together.", 0],
    ["Ask guests to calculate totals themselves.", 0],
  ], "Tests organized check handling."),
  q("SV13", "technical", "Food falls from your tray near a guest. What should you do?", [
    ["Pick it up and re-plate it.", 0],
    ["Secure the area, apologize, notify the team, and arrange a clean replacement.", 3],
    ["Leave it for the busser.", 0],
    ["Serve the remaining food without checking for contamination.", 0],
  ], "Checks sanitation and recovery."),
  q("SV14", "technical", "A guest says they paid cash, but the check still shows open. What should you do?", [
    ["Close it as cash without verifying.", 0],
    ["Check the receipt/payment trail and involve the cashier or manager before changing anything.", 3],
    ["Ask the guest to pay again immediately.", 1],
    ["Delete the check.", 0],
  ], "Tests payment verification."),
  q("SV15", "technical", "Before submitting closing paperwork, what is required for server sidework under restaurant policy?", [
    ["A coworker says it looks fine.", 0],
    ["The designated cashier checks the section, including under tables and oily surfaces, and signs after it is complete.", 3],
    ["Only the visible tabletops are wiped.", 1],
    ["No check is needed on slow nights.", 0],
  ], "Tests the restaurant’s sidework verification process."),
  q("SV16", "technical", "What is the safest way to carry a loaded tray?", [
    ["Load it beyond your control to reduce trips.", 0],
    ["Balance it within your ability, keep a clear path, and ask for help when needed.", 3],
    ["Carry hot items over a child’s head.", 0],
    ["Use one hand while texting with the other.", 0],
  ], "Checks practical service safety."),
  q("SV17", "technical", "A guest disputes an automatic gratuity or tip entry. What should the server do?", [
    ["Change it secretly.", 0],
    ["Stay factual, stop further processing if appropriate, and ask the manager to review the check and policy.", 3],
    ["Argue that the guest must pay it.", 0],
    ["Post the receipt online.", 0],
  ], "Checks careful handling of a sensitive payment concern."),
  q("SV18", "technical", "Your section is stable and another server’s food is waiting in the window. What is best?", [
    ["Run the food accurately if permitted, communicating with the server as needed.", 3],
    ["Ignore it because the table is not yours.", 0],
    ["Move it away from the window.", 0],
    ["Serve it to any nearby table.", 0],
  ], "Tests teamwork without sacrificing accuracy."),
];

const bartenderQuestions: AssessmentQuestion[] = [
  q("BT01", "technical", "A guest ordering alcohol cannot provide acceptable proof of age. What should the bartender do?", [
    ["Accept a friend’s statement.", 0],
    ["Decline alcohol service and follow the current ID/manager procedure.", 3],
    ["Serve beer but not liquor.", 0],
    ["Accept any photo on the guest’s phone automatically.", 0],
  ], "Checks consistent ID compliance."),
  q("BT02", "technical", "A guest shows signs of intoxication and asks for another round. What is best?", [
    ["Serve a weaker drink without telling them.", 0],
    ["Pause alcohol service, notify the manager, offer appropriate nonalcoholic options, and follow responsible-service procedure.", 3],
    ["Let another guest buy it for them.", 0],
    ["Serve it to avoid conflict.", 0],
  ], "Checks responsible service and escalation."),
  q("BT03", "technical", "How should spirits be measured?", [
    ["By free-pouring any amount the guest prefers.", 0],
    ["Using the restaurant’s approved measuring method and recipe for a consistent pour.", 3],
    ["By filling the glass halfway.", 0],
    ["Using a larger pour for regular guests without approval.", 0],
  ], "Tests pour consistency and house controls."),
  q("BT04", "technical", "A guest wants to open a tab. What is the safest process?", [
    ["Remember the guest’s face and enter everything later.", 0],
    ["Follow the approved POS/payment procedure, confirm the correct guest/tab, and protect card information.", 3],
    ["Photograph the card as backup.", 0],
    ["Place all bar guests on one tab.", 0],
  ], "Checks tab accuracy and payment security."),
  q("BT05", "technical", "A clean-looking glass has lipstick on the rim. What should you do?", [
    ["Wipe the rim with a bar towel and use it.", 0],
    ["Remove it from service and run it through the approved full washing/sanitizing process.", 3],
    ["Turn the marked side away from the guest.", 0],
    ["Use it only for water.", 0],
  ], "Tests glassware sanitation."),
  q("BT06", "technical", "A guest reports a citrus allergy when ordering a cocktail. What should the bartender do?", [
    ["Remove the garnish only.", 0],
    ["Clarify the concern, communicate it, use the allergy procedure, and avoid guaranteeing no cross-contact.", 3],
    ["Recommend a drink with less citrus.", 1],
    ["Say alcohol removes allergens.", 0],
  ], "Checks allergy communication in a shared bar environment."),
  q("BT07", "technical", "Several server drink tickets and one bar guest order arrive together. What is best?", [
    ["Make only the bar guest’s order because they can see you.", 0],
    ["Use an organized, fair ticket sequence while addressing urgent safety or quality needs and communicating delays.", 3],
    ["Choose orders randomly.", 0],
    ["Clear tickets before making drinks.", 0],
  ], "Tests queue management and communication."),
  q("BT08", "technical", "A draft beer has excessive foam. What should happen first?", [
    ["Serve it after scooping out the foam.", 0],
    ["Check glass cleanliness, pouring technique, and equipment/temperature issues before serving a proper replacement.", 3],
    ["Add ice.", 0],
    ["Mix it with beer from another tap.", 0],
  ], "Tests basic draft troubleshooting and quality control."),
  q("BT09", "technical", "A guest orders a bottle of wine that you have not opened before. What is best?", [
    ["Guess and open it away from the guest.", 0],
    ["Confirm the bottle/order and follow the restaurant’s presentation and opening procedure; ask for help if needed.", 3],
    ["Substitute another bottle without asking.", 0],
    ["Pre-open it and discard the cork before confirming.", 1],
  ], "Checks accuracy and willingness to request assistance."),
  q("BT10", "technical", "You do not remember the recipe for a cocktail. What should you do?", [
    ["Create your own version and charge the normal price.", 0],
    ["Check the approved recipe or ask the lead/manager before making it.", 3],
    ["Ask the guest to explain every ingredient.", 1],
    ["Tell the server the drink is unavailable.", 0],
  ], "Tests recipe consistency and coachability."),
  q("BT11", "technical", "A guest repeatedly harasses another guest or employee at the bar. What should you do?", [
    ["Ignore it unless someone is physically hurt.", 0],
    ["Notify the manager/security channel promptly, prioritize safety, and avoid escalating the confrontation alone.", 3],
    ["Join the argument.", 0],
    ["Post a video online.", 0],
  ], "Checks safety escalation and professional boundaries."),
  q("BT12", "technical", "Glass breaks in or beside an ice well. What is the correct response?", [
    ["Remove visible pieces and keep using the ice.", 0],
    ["Stop using the well and follow the complete glass-breakage procedure, including discarding affected ice and cleaning/sanitizing.", 3],
    ["Cover the area with a towel until closing.", 0],
    ["Use the ice only for server tickets.", 0],
  ], "Checks full contamination control."),
  q("BT13", "technical", "An adult orders two drinks and immediately passes one to someone who was refused service. What should you do?", [
    ["Ignore it because the adult paid.", 0],
    ["Intervene according to responsible-service policy and notify the manager.", 3],
    ["Charge for a third drink.", 0],
    ["Move them to a table so it is not a bar issue.", 0],
  ], "Checks awareness of indirect alcohol service."),
  q("BT14", "technical", "What is the best approach when a guest is drinking rapidly?", [
    ["Encourage another round before happy hour ends.", 0],
    ["Monitor service, slow or stop as required, offer water/food appropriately, and involve the manager early.", 3],
    ["Make drinks stronger so they order fewer.", 0],
    ["Ignore pace if the tab is paid.", 0],
  ], "Tests proactive responsible-service judgment."),
  q("BT15", "technical", "A friend asks you for a free drink. What should you do?", [
    ["Give it to them if no manager is nearby.", 0],
    ["Charge and ring items correctly; use only manager-approved comps or promotions.", 3],
    ["Pour it and enter it as spilled product.", 0],
    ["Ask another bartender to do it.", 0],
  ], "Checks inventory and sales integrity."),
  q("BT16", "technical", "At closing, the bottle count and POS usage do not match. What should you do?", [
    ["Change the count to match the POS.", 0],
    ["Recount, preserve accurate records, and report the variance to the authorized manager.", 3],
    ["Replace the difference with cash.", 0],
    ["Ignore small differences every night.", 0],
  ], "Checks inventory reconciliation integrity."),
  q("BT17", "technical", "A server says a cocktail is wrong but the ticket matches the drink you made. What is best?", [
    ["Refuse to remake it.", 0],
    ["Verify the guest’s actual request and ticket details, coordinate the correction, and involve a manager when policy requires.", 3],
    ["Tell the server to serve it anyway.", 0],
    ["Throw it away without recording anything.", 1],
  ], "Tests fact-based teamwork and remake control."),
  q("BT18", "technical", "A guest becomes unresponsive at the bar. What should you do?", [
    ["Let them sleep while you continue service.", 0],
    ["Treat it as an emergency: alert the manager, call emergency services according to procedure, and protect the guest until help arrives.", 3],
    ["Give them coffee and send them outside alone.", 0],
    ["Ask another guest to drive them immediately.", 0],
  ], "Checks urgent emergency response."),
];

workStyle.push(
  q("WS13", "work_style", "Two managers give you instructions that seem to conflict. What should you do?", [
    ["Choose the instruction you prefer and say nothing.", 0],
    ["Briefly explain the conflict and ask the Manager on Duty to confirm the priority.", 3],
    ["Do neither task until someone notices.", 0],
    ["Ask a guest to decide which task is more important.", 0],
  ], "Checks respectful clarification and operational priority."),
  q("WS14", "work_style", "You arrive and realize part of your required uniform or grooming standard is not correct. What is best?", [
    ["Hide it and hope nobody notices.", 0],
    ["Tell the manager immediately and correct it before working when possible.", 3],
    ["Borrow an unsanitary item without permission.", 0],
    ["Argue that appearance never affects service.", 1],
  ], "Looks for readiness, hygiene awareness, and early communication."),
  q("WS15", "work_style", "An urgent personal matter happens while you are on duty. What should you do?", [
    ["Leave the station without telling anyone.", 0],
    ["Notify the Manager on Duty, explain what you need, and follow the approved coverage plan.", 3],
    ["Stay on a personal call while continuing to handle guest payments.", 0],
    ["Ask a coworker to clock you out later.", 0],
  ], "Checks responsible communication when personal needs affect coverage."),
);

communication.push(
  q("CM11", "communication", "A guest has difficulty understanding your explanation. What is the best next step?", [
    ["Repeat the same words more loudly.", 0],
    ["Use simpler respectful wording, available visual information, and confirm understanding.", 3],
    ["Speak only to another person in the party.", 1],
    ["End the conversation quickly.", 0],
  ], "Checks adaptable and respectful guest communication."),
  q("CM12", "communication", "Which read-back is strongest for a takeout order?", [
    ["‘You ordered some seafood. Correct?’", 0],
    ["Repeat each item, quantity, key modifier, sauce/side, pickup name, and quoted time.", 3],
    ["Repeat only the total price.", 1],
    ["Ask the guest to check after they arrive.", 0],
  ], "Tests structured confirmation of order details."),
  q("CM13", "communication", "A popular menu item is unavailable. What is the best wording?", [
    ["‘We don’t have it. Pick something else.’", 0],
    ["Apologize briefly, state that it is unavailable, and offer accurate alternatives.", 3],
    ["Take the order anyway and let the kitchen explain.", 0],
    ["Blame the supplier or another shift.", 0],
  ], "Checks concise bad-news delivery and helpful alternatives."),
  q("CM14", "communication", "A guest says they plan to post a negative online review. What should you say?", [
    ["Tell them negative reviews hurt employees.", 0],
    ["Invite them to explain the concern, listen without arguing, and involve the manager in resolving it now.", 3],
    ["Offer something free without approval if they promise five stars.", 0],
    ["Ask for their social-media username.", 0],
  ], "Checks service recovery without pressuring or buying a review."),
  q("CM15", "communication", "You disagree with a coworker about who owns a task during a rush. What is best?", [
    ["Debate it in front of guests.", 0],
    ["Keep service moving, use brief factual communication, and ask the manager to clarify responsibility if needed.", 3],
    ["Stop doing all shared tasks.", 0],
    ["Send an angry team message while guests wait.", 0],
  ], "Checks conflict communication that protects service."),
);

problemSolving.push(
  q("PS11", "problem_solving", "The POS becomes unavailable while guests need to order and pay. What should you do?", [
    ["Create your own handwritten prices and accept every payment type.", 0],
    ["Notify the manager and follow the approved outage procedure while documenting transactions carefully.", 3],
    ["Tell all guests their meals are free.", 0],
    ["Keep retrying cards without recording attempts.", 0],
  ], "Checks controlled continuity during a system outage."),
  q("PS12", "problem_solving", "A guest slips or falls in the restaurant. What should happen first?", [
    ["Ask whether they plan to sue.", 0],
    ["Protect the area, get the manager, offer appropriate immediate assistance, and follow incident procedure.", 3],
    ["Move the guest immediately even if they report serious pain.", 0],
    ["Clean the area and say nothing.", 0],
  ], "Checks safety response and escalation without assigning blame."),
  q("PS13", "problem_solving", "A guest believes the same card payment was charged twice. What is best?", [
    ["Refund one charge before checking records.", 0],
    ["Review the POS receipts/status with the authorized manager and explain the verified next step.", 3],
    ["Tell the guest to dispute every charge with the bank.", 1],
    ["Delete the open check.", 0],
  ], "Checks evidence-based payment investigation."),
  q("PS14", "problem_solving", "A delivery order has been ready for a long time but no driver has arrived. What should you do?", [
    ["Throw it away without recording anything.", 0],
    ["Verify platform/order status, protect food quality, notify the manager, and follow the approved remake/contact process.", 3],
    ["Mark it picked up so it leaves the screen.", 0],
    ["Give it to another customer.", 0],
  ], "Checks platform status, food quality, and authorization."),
  q("PS15", "problem_solving", "A guest asks for an accessible seating arrangement. What is best?", [
    ["Say only one section can handle special requests.", 0],
    ["Ask what seating arrangement would work, offer available accessible options, and involve the manager if a barrier remains.", 3],
    ["Ask the guest to explain their medical diagnosis.", 0],
    ["Place them at any open table without discussion.", 1],
  ], "Checks practical accommodation without requesting medical details."),
);

hostCashier.push(
  q("HC19", "technical", "A high chair would block a busy aisle. What should the host do?", [
    ["Use it there because the requested table is open.", 0],
    ["Offer a safe table arrangement that meets the party’s needs without blocking the aisle.", 3],
    ["Tell the family high chairs are never available.", 0],
    ["Place the high chair in the aisle temporarily.", 1],
  ], "Tests seating safety and guest-centered alternatives."),
  q("HC20", "technical", "A waitlisted party does not respond when their table is ready. What should the host do?", [
    ["Hold the table indefinitely.", 0],
    ["Follow the documented contact/hold-time procedure, note the attempt, and continue the list fairly.", 3],
    ["Delete every similar name.", 0],
    ["Seat the last party on the list instead.", 1],
  ], "Checks consistent waitlist procedure."),
  q("HC21", "technical", "A large party requires combining tables. What should happen?", [
    ["Move any table without telling servers.", 0],
    ["Confirm the approved layout, aisle safety, section assignment, and table status before seating.", 3],
    ["Let guests rearrange the floor.", 0],
    ["Block an exit if it creates more seats.", 0],
  ], "Tests capacity planning and safe floor control."),
  q("HC22", "technical", "When should an online order be marked ready?", [
    ["As soon as the ticket prints.", 0],
    ["After the complete order has been verified, packaged, and placed in the approved pickup location.", 3],
    ["When a driver enters the parking lot.", 1],
    ["At the quoted time even if items are missing.", 0],
  ], "Checks accurate platform status and handoff readiness."),
  q("HC23", "technical", "A guest requests a cash refund for a card transaction. What should the cashier do?", [
    ["Pay cash immediately to end the complaint.", 0],
    ["Verify the transaction and obtain manager authorization, then use the approved refund method.", 3],
    ["Use money from another server’s checkout.", 0],
    ["Void a different guest’s payment.", 0],
  ], "Checks refund authorization and payment-channel controls."),
  q("HC24", "technical", "You suspect a cash bill may not be genuine. What is best?", [
    ["Accuse the guest publicly.", 0],
    ["Follow the restaurant’s bill-verification procedure and discreetly involve the manager.", 3],
    ["Keep it and pay the restaurant later if it is fake.", 0],
    ["Tear it in half.", 0],
  ], "Checks discreet verification and escalation."),
  q("HC25", "technical", "A gift card balance is lower than the guest expected. What should the cashier do?", [
    ["Change the balance manually.", 0],
    ["Verify the card and transaction history through approved tools, then involve the manager if unresolved.", 3],
    ["Tell the guest the card is worthless.", 0],
    ["Use another guest’s card balance.", 0],
  ], "Checks system verification and authorization."),
  q("HC26", "technical", "A caller asks for a guest’s phone number from a reservation. What should the host do?", [
    ["Share it if the caller knows the guest’s name.", 0],
    ["Do not disclose it; follow privacy and manager procedure for any legitimate message.", 3],
    ["Read only the last seven digits.", 0],
    ["Post the request in a public group chat.", 0],
  ], "Checks protection of candidate and guest contact information."),
  q("HC27", "technical", "The manager cuts a server from the floor. What must the host update?", [
    ["Nothing until the next shift.", 0],
    ["The active floor/rotation and any affected table assignments, then confirm who is next.", 3],
    ["Only the printed schedule.", 1],
    ["Every reservation name.", 0],
  ], "Tests accurate floor transition management."),
  q("HC28", "technical", "Someone asks you to delete several reservations using a manager-only function. What should you do?", [
    ["Use a manager code you saw earlier.", 0],
    ["Ask the authorized manager to review and perform or approve the deletion.", 3],
    ["Delete them one at a time to avoid the restriction.", 0],
    ["Mark them all as seated.", 0],
  ], "Checks authorization and record integrity."),
  q("HC29", "technical", "A guest requests a quieter or more accessible table. What should the host do?", [
    ["Ask why they have a medical need.", 0],
    ["Focus on the requested seating feature, offer available options, and update assignment/rotation correctly.", 3],
    ["Refuse because it changes rotation.", 0],
    ["Promise a table that is occupied.", 0],
  ], "Checks accommodation-focused seating without medical inquiry."),
  q("HC30", "technical", "What is required before leaving a cashier station at close?", [
    ["Leave the drawer open for the next employee.", 0],
    ["Complete the approved checkout, reconcile records with the authorized manager, secure funds, and finish assigned closing tasks.", 3],
    ["Take receipts home to review.", 0],
    ["Share the login so another employee can finish later.", 0],
  ], "Tests secure end-of-shift control."),
);

serverQuestions.push(
  q("SV19", "technical", "You learn that a menu item is sold out after a guest has ordered it. What should you do?", [
    ["Wait until the rest of the food arrives.", 0],
    ["Tell the guest promptly, apologize, offer accurate alternatives, and update the order correctly.", 3],
    ["Substitute a similar item without asking.", 0],
    ["Cancel the whole table’s order.", 0],
  ], "Tests prompt menu communication and accurate correction."),
  q("SV20", "technical", "A very hot plate is going to a table with children. What is best?", [
    ["Set it directly in front of a child.", 0],
    ["Warn the table clearly and place it safely with adult awareness according to procedure.", 3],
    ["Ask the child to test the plate.", 0],
    ["Balance it on the edge of the table.", 0],
  ], "Checks hot-food service safety."),
  q("SV21", "technical", "Under restaurant policy, when should paper plates or crab shellers be brought?", [
    ["To every table automatically.", 1],
    ["When requested, while still making sure guests have the standard items needed for their meal.", 3],
    ["Only after the check is paid.", 0],
    ["Never.", 0],
  ], "Tests the restaurant’s request-based supply policy."),
  q("SV22", "technical", "Before a guest orders alcohol, what should the server communicate about the restaurant’s alcohol remake/refund policy?", [
    ["Nothing; explain only if the guest complains.", 0],
    ["Show or explain the menu notice before the order and do not sell if the guest does not agree to the stated policy.", 3],
    ["Promise unlimited remakes.", 0],
    ["Say every alcohol purchase can be refunded in cash.", 0],
  ], "Tests advance disclosure of the restaurant’s stated alcohol policy; current law and manager direction control."),
  q("SV23", "technical", "A guest requests a birthday dessert and mentions an allergy. What should happen?", [
    ["Bring the usual dessert because it is free.", 0],
    ["Treat the allergy as a food-safety issue, verify approved options, and communicate with the manager/kitchen.", 3],
    ["Remove the visible garnish only.", 0],
    ["Ask another guest to taste it first.", 0],
  ], "Checks that celebrations do not override allergy procedure."),
  q("SV24", "technical", "You have hot food ready, a guest waiting to pay, and a new table seated. What is best?", [
    ["Handle only the new table for the next ten minutes.", 0],
    ["Protect hot-food quality, acknowledge both tables, communicate timing, and request team help where needed.", 3],
    ["Hide the check so the paying guest waits.", 0],
    ["Leave the food in the window without telling anyone.", 0],
  ], "Tests prioritization and communication under load."),
  q("SV25", "technical", "A guest asks you to remove an item from the bill because they did not like it. What should you do?", [
    ["Delete it using any available code.", 0],
    ["Listen, verify what happened, and ask the manager to apply the approved recovery decision.", 3],
    ["Promise a full refund before checking the item.", 0],
    ["Tell the guest taste complaints are never considered.", 0],
  ], "Checks manager authorization for comps/voids."),
  q("SV26", "technical", "How should a server work with a busser when a table is turning?", [
    ["Assume the busser knows every priority.", 0],
    ["Communicate table status and urgent needs clearly, help when possible, and verify the table is actually ready.", 3],
    ["Mark it clean before anyone checks it.", 0],
    ["Seat the next party personally without the host.", 1],
  ], "Tests coordinated table turnover."),
  q("SV27", "technical", "A guest asks to take an unfinished alcoholic drink away. What should the server do?", [
    ["Provide any cup and lid.", 0],
    ["Do not improvise; follow current law, license conditions, restaurant policy, and manager direction.", 3],
    ["Hide it inside a food bag.", 0],
    ["Let the guest decide what is legal.", 0],
  ], "Checks escalation where alcohol rules and license conditions control."),
  q("SV28", "technical", "A signed receipt has an unclear tip amount. What should the server do?", [
    ["Enter the larger possible amount.", 0],
    ["Do not alter the receipt; follow the manager-approved clarification and entry procedure.", 3],
    ["Rewrite the tip neatly.", 0],
    ["Ask a coworker to guess.", 0],
  ], "Checks tip-entry and record integrity."),
  q("SV29", "technical", "A table must be transferred to another server. What is required?", [
    ["Change the name in the POS and leave.", 1],
    ["Obtain approval, give a complete table/payment handoff, and confirm the transfer in the system.", 3],
    ["Ask the guests to reorder.", 0],
    ["Keep both servers on the same check without explanation.", 0],
  ], "Tests accountable table transfer."),
  q("SV30", "technical", "What should a final table check include before a server leaves?", [
    ["Only whether the tip was entered.", 0],
    ["Payment is correctly closed, guests’ remaining needs are handed off, section/sidework is complete, and the Manager on Duty releases the server.", 3],
    ["A coworker agrees to watch the area.", 1],
    ["The server has removed personal items.", 0],
  ], "Tests complete end-of-shift accountability."),
);

bartenderQuestions.push(
  q("BT19", "technical", "When should identification be checked for alcohol service?", [
    ["Only when a manager is nearby.", 0],
    ["Consistently according to current law and restaurant ID policy before service when age is not established.", 3],
    ["After the first drink is served.", 0],
    ["Only for cash-paying guests.", 0],
  ], "Checks consistent ID procedure."),
  q("BT20", "technical", "An ID appears altered or does not match the guest. What should the bartender do?", [
    ["Keep the ID permanently.", 0],
    ["Do not serve alcohol; follow the current ID-verification and manager procedure.", 3],
    ["Accept a social-media profile instead.", 0],
    ["Serve one drink while checking later.", 0],
  ], "Checks safe handling of questionable identification."),
  q("BT21", "technical", "What is best practice when giving cash change at a busy bar?", [
    ["Combine change for several tabs in your hand.", 0],
    ["Keep each transaction separate, state the tender, enter it first, and count change accurately.", 3],
    ["Round every total to the nearest dollar.", 0],
    ["Leave the drawer open between guests.", 0],
  ], "Checks cash-control accuracy under pressure."),
  q("BT22", "technical", "You want to pre-batch a popular cocktail for speed. What should you do?", [
    ["Mix any quantity without recording it.", 0],
    ["Use only an approved recipe, container, labeling, storage, and manager-authorized batching procedure.", 3],
    ["Reuse an unlabeled bottle.", 0],
    ["Add extra alcohol to make it last longer.", 0],
  ], "Checks recipe, labeling, inventory, and authorization controls."),
  q("BT23", "technical", "How should cut fruit and garnishes be handled?", [
    ["With bare hands if the bar is busy.", 0],
    ["With approved hygienic handling, clean tools, proper storage, and required time/temperature controls.", 3],
    ["Reuse garnish from an untouched drink.", 0],
    ["Store them beside cleaning chemicals.", 0],
  ], "Checks basic garnish food safety."),
  q("BT24", "technical", "A keg or heavy bar item needs to be changed. What is best?", [
    ["Lift it alone even if you cannot control it.", 0],
    ["Use the approved safe method and equipment, and ask for help when needed.", 3],
    ["Roll it through a guest walkway.", 0],
    ["Leave disconnected lines open.", 0],
  ], "Checks safe material handling without testing medical status."),
  q("BT25", "technical", "A full drink spills before reaching the guest. What should happen?", [
    ["Make another and hide the spill from inventory.", 0],
    ["Secure/clean the area, record the spill according to policy, and remake through the correct ticket process.", 3],
    ["Charge the guest twice automatically.", 0],
    ["Serve whatever remains in the glass.", 0],
  ], "Checks safety, inventory, and remake procedure."),
  q("BT26", "technical", "A guest says a properly measured drink is too weak. What should the bartender do?", [
    ["Add an unrecorded extra pour.", 0],
    ["Explain or verify the recipe respectfully and involve the manager for any approved adjustment.", 3],
    ["Argue about the guest’s tolerance.", 0],
    ["Pour from a different bottle without recording it.", 0],
  ], "Checks recipe integrity and complaint handling."),
  q("BT27", "technical", "A guest asks for alcohol packaged to go. What should the bartender do?", [
    ["Use any cup as long as it has a lid.", 0],
    ["Follow current Alabama law, license conditions, approved packaging, and manager procedure; decline if requirements are not met.", 3],
    ["Hide it in a takeout bag.", 0],
    ["Let the server decide without checking.", 0],
  ], "Checks compliance where current law and license conditions control."),
  q("BT28", "technical", "A guest who cannot be served alcohol asks for a nonalcoholic option. What is best?", [
    ["Refuse all service and embarrass the guest.", 0],
    ["Offer accurate nonalcoholic choices while maintaining the alcohol-service boundary.", 3],
    ["Add a small amount of alcohol without saying so.", 0],
    ["Serve a drink that only looks alcoholic but charge for liquor.", 0],
  ], "Tests hospitality while maintaining a service restriction."),
  q("BT29", "technical", "What should a bartender include in a shift handoff?", [
    ["Only the cash total.", 1],
    ["Open tabs, guest/service concerns, inventory or equipment issues, pending tickets, and manager actions.", 3],
    ["Personal opinions about regular guests.", 0],
    ["Nothing if the next bartender is experienced.", 0],
  ], "Checks complete and factual operational handoff."),
  q("BT30", "technical", "After alcohol service is stopped, a guest appears unable to leave safely. What is best?", [
    ["Send the guest outside alone immediately.", 0],
    ["Involve the manager, maintain the service cutoff, and follow approved safety/transport procedures without guaranteeing personal transportation.", 3],
    ["Serve one last drink while they wait.", 0],
    ["Give their keys to any nearby person.", 0],
  ], "Checks post-cutoff safety and manager involvement."),
);

hostCashier.push(
  q("HC31", "technical", "What is the correct basic sequence for a walk-in party?", [
    ["Point to an open table and let the party seat itself.", 0],
    ["Welcome them, confirm party size and seating needs, check availability/rotation, then escort and update the floor system.", 3],
    ["Ask for payment before discussing seating.", 0],
    ["Write only the first name and walk away.", 1],
  ], "Tests the complete walk-in seating sequence."),
  q("HC32", "technical", "Only part of a large party has arrived. What should the host do?", [
    ["Always seat them immediately, regardless of policy or table demand.", 0],
    ["Apply the restaurant’s complete-party policy consistently, explain options, and involve the manager for an exception.", 3],
    ["Remove them from the waitlist without explanation.", 0],
    ["Hold several tables indefinitely.", 0],
  ], "Checks consistent seating-policy application."),
  q("HC33", "technical", "Two tables become ready at the same time. How should the next assignments be chosen?", [
    ["Give both to the same favorite server.", 0],
    ["Use the current rotation, party-size fit, guest requests, and any manager-approved floor adjustment.", 3],
    ["Let the parties choose their server by appearance.", 0],
    ["Use whichever section is closest to the door.", 1],
  ], "Tests fair and operationally sound floor management."),
  q("HC34", "technical", "A guest points to empty tables and questions the wait. What is the best response?", [
    ["Say, ‘Those tables are none of your business.’", 0],
    ["Explain briefly that tables may be awaiting cleaning, assigned, reserved, or limited by service capacity, then give an honest update.", 3],
    ["Promise one of the tables immediately.", 0],
    ["Blame employees who are not present.", 0],
  ], "Checks accurate explanation of apparent availability."),
  q("HC35", "technical", "A caller claiming to be technical support asks for a POS login or verification code. What should you do?", [
    ["Provide it if the caller knows the restaurant name.", 0],
    ["Do not share anything; end or pause the call and verify through the authorized manager/support channel.", 3],
    ["Text the code from your personal phone.", 0],
    ["Ask a coworker to take responsibility for the call.", 0],
  ], "Checks resistance to credential theft and social engineering."),
  q("HC36", "technical", "A guest pays cash and declines a receipt. What should the cashier do?", [
    ["Skip entering the sale.", 0],
    ["Complete the transaction accurately and offer or retain the receipt according to procedure.", 3],
    ["Remove the tax because no receipt is wanted.", 0],
    ["Put the payment in a separate envelope.", 0],
  ], "Checks that every sale is recorded regardless of receipt preference."),
  q("HC37", "technical", "A party wants to pay one check with two cards and cash. What is best?", [
    ["Guess the amounts and run all payments.", 0],
    ["Clarify the exact split, repeat it back, process one tender at a time, and verify the remaining balance.", 3],
    ["Charge every card for the full amount, then void extras.", 0],
    ["Refuse all mixed payments automatically.", 1],
  ], "Tests multi-tender accuracy."),
  q("HC38", "technical", "The receipt printer stops working after a card is inserted. What should happen first?", [
    ["Run the card again immediately.", 0],
    ["Check the transaction status in the POS/terminal before retrying, then follow manager procedure.", 3],
    ["Assume it declined because no paper printed.", 0],
    ["Ask the guest to pay cash too.", 0],
  ], "Checks duplicate-charge prevention."),
  q("HC39", "technical", "A person asks whether a named guest has a reservation tonight. What is best?", [
    ["Confirm the reservation and give the arrival time.", 0],
    ["Protect guest information and follow the approved message/verification procedure.", 3],
    ["Share only the party size.", 0],
    ["Give the caller the guest’s phone number.", 0],
  ], "Checks reservation privacy."),
  q("HC40", "technical", "What belongs in reservation notes?", [
    ["Relevant service details stated factually, such as approved seating requests or celebration notes.", 3],
    ["Jokes about the guest.", 0],
    ["Guesses about a disability or medical condition.", 0],
    ["Full card numbers.", 0],
  ], "Checks professional, necessary recordkeeping."),
  q("HC41", "technical", "A server has just received a large party and is next in rotation again. What should the host do?", [
    ["Seat the server again without looking at capacity.", 0],
    ["Assess current workload and follow the floor plan or ask the manager for a documented rotation adjustment.", 3],
    ["Remove the server permanently from rotation.", 0],
    ["Ask the waiting guest to decide.", 0],
  ], "Tests capacity-aware rotation decisions."),
  q("HC42", "technical", "Two occupied tables are swapped between servers with manager approval. What must happen?", [
    ["Only tell the servers verbally.", 1],
    ["Update the floor/board and relevant POS ownership, then confirm both handoffs.", 3],
    ["Delete both tables from the board.", 0],
    ["Wait until payment to change anything.", 0],
  ], "Checks complete table/server transfer records."),
  q("HC43", "technical", "An emergency requires guests to leave the building. What is the host/cashier priority?", [
    ["Finish every open payment first.", 0],
    ["Follow the emergency plan and manager/first-responder direction, help direct guests safely, and do not block exits.", 3],
    ["Lock the front door so nobody enters or leaves.", 0],
    ["Return to collect personal belongings first.", 0],
  ], "Checks emergency-plan compliance and life safety."),
  q("HC44", "technical", "A takeout caller reports a severe allergy. What should the host/cashier do?", [
    ["Guarantee the kitchen can make anything allergen-free.", 0],
    ["Record the concern accurately and involve the manager/kitchen through the allergy procedure before confirming the order.", 3],
    ["Remove one ingredient from the POS description only.", 0],
    ["Tell the caller to order online without notes.", 0],
  ], "Checks safe allergy handoff for takeout."),
  q("HC45", "technical", "What should the cashier verify before closing a pickup check?", [
    ["Only that a bag is on the shelf.", 0],
    ["Correct order/guest, correct payment status and tender, any required signature/receipt, and completed handoff.", 3],
    ["That the guest left a tip.", 0],
    ["That another employee recognizes the customer.", 1],
  ], "Tests full pickup-payment completion."),
);

serverQuestions.push(
  q("SV31", "technical", "A seafood boil bag appears damaged and liquid is leaking. What should the server do?", [
    ["Carry it through the dining room quickly.", 0],
    ["Stop, contain the spill safely, notify the kitchen/manager, and obtain properly packaged replacement service.", 3],
    ["Place the leaking bag directly on the table.", 0],
    ["Wrap it in a guest napkin.", 0],
  ], "Checks safe handling of a hot, leaking product."),
  q("SV32", "technical", "A guest asks how spicy a sauce is. What is the best response?", [
    ["Say every level tastes the same.", 0],
    ["Explain the restaurant’s actual spice scale and ingredients accurately, and ask about preferences or concerns.", 3],
    ["Promise the hottest level is mild.", 0],
    ["Choose a level for the guest without asking.", 0],
  ], "Tests menu knowledge and expectation setting."),
  q("SV33", "technical", "A menu item is listed at market price. What should the server do?", [
    ["Let the guest discover the price on the bill.", 0],
    ["Confirm the current approved price before the order and communicate it clearly.", 3],
    ["Estimate a lower price.", 0],
    ["Use yesterday’s price without checking.", 1],
  ], "Checks price accuracy and advance disclosure."),
  q("SV34", "technical", "A guest asks whether two menu items share ingredients or preparation surfaces. What is best?", [
    ["Guess based on how the dishes look.", 0],
    ["Check the approved ingredient/allergen information and consult the kitchen or manager before answering.", 3],
    ["Promise they never share anything.", 0],
    ["Say ingredients are confidential.", 0],
  ], "Checks verified menu knowledge."),
  q("SV35", "technical", "Guests need help opening crab legs. What should the server do?", [
    ["Use a tool from another occupied table.", 0],
    ["Provide the approved clean crab sheller/tool when requested and explain safe use if needed.", 3],
    ["Tell guests to use steak knives.", 0],
    ["Open every piece with bare hands at the table.", 0],
  ], "Tests sanitary and safe tool service."),
  q("SV36", "technical", "Before refilling a beverage, what should the server verify?", [
    ["That the glass is empty, then refill it with any drink.", 0],
    ["The correct beverage, refill policy, guest preference, and safe handling without contaminating the glass or pitcher.", 3],
    ["Only whether the refill is free.", 1],
    ["Nothing if the cup color looks familiar.", 0],
  ], "Checks refill accuracy and sanitation."),
  q("SV37", "technical", "A food runner reaches the table with several entrées. What is best?", [
    ["Call out every dish until someone claims it.", 1],
    ["Use seat positions/order details to place each item accurately and confirm uncertain items discreetly.", 3],
    ["Set everything at one end of the table.", 0],
    ["Ask guests to pass hot plates over children.", 0],
  ], "Tests organized, safe food delivery."),
  q("SV38", "technical", "A large party is subject to a disclosed service-charge policy. What should the server do?", [
    ["Hide it until the final check.", 0],
    ["Explain the applicable menu/check policy clearly at the appropriate time and direct disputes to the manager.", 3],
    ["Add a second tip without disclosure.", 0],
    ["Change the percentage based on the guest.", 0],
  ], "Checks consistent, transparent charge communication."),
  q("SV39", "technical", "One guest is not ready to order while the rest of the table is ready. What is best?", [
    ["Pressure the guest to choose immediately.", 0],
    ["Clarify whether the table wants more time or wants available orders started, then coordinate timing accurately.", 3],
    ["Submit a random item for that guest.", 0],
    ["Ignore the table for twenty minutes.", 0],
  ], "Tests pacing and guest-led order coordination."),
  q("SV40", "technical", "What should happen during server cash-out?", [
    ["Mix personal cash with restaurant funds.", 0],
    ["Reconcile checks, tenders, receipts, tips, and required paperwork with the authorized manager/cashier.", 3],
    ["Change closed checks to make totals easier.", 0],
    ["Leave unsigned paperwork on a guest table.", 0],
  ], "Checks accountable cash-out procedure."),
  q("SV41", "technical", "A guest requests an item not listed on the menu. What should the server do?", [
    ["Promise the kitchen will make it.", 0],
    ["Check approved substitutions or modifications with the kitchen/manager before confirming availability or price.", 3],
    ["Enter it as a free open item.", 0],
    ["Tell the guest to bring ingredients next time.", 0],
  ], "Checks authorization and accurate custom-order communication."),
  q("SV42", "technical", "A guest dislikes an alcoholic drink and asks for a refund. What should the server do?", [
    ["Promise cash back immediately.", 0],
    ["Refer to the disclosed menu policy, stop further promises, and involve the manager for the permitted remedy.", 3],
    ["Make unlimited replacements.", 0],
    ["Remove an unrelated food item instead.", 0],
  ], "Tests consistent use of the disclosed house policy and manager authority."),
  q("SV43", "technical", "A table surface was wiped but still feels oily. What should happen?", [
    ["Seat guests because it looks clean.", 0],
    ["Clean it again with the approved method and verify it is ready before seating.", 3],
    ["Cover it with menus.", 0],
    ["Tell guests seafood restaurants are always oily.", 0],
  ], "Checks actual cleanliness verification."),
  q("SV44", "technical", "A handheld ordering device loses connection before an order is confirmed. What should the server do?", [
    ["Assume the order reached the kitchen.", 0],
    ["Verify whether the order posted before resending and follow outage procedure to prevent duplicates.", 3],
    ["Send the full order repeatedly.", 0],
    ["Tell the guest to order again from memory later.", 0],
  ], "Checks duplicate-order prevention."),
  q("SV45", "technical", "A guest makes a credible threat toward an employee. What should the server do?", [
    ["Confront the guest alone.", 0],
    ["Prioritize immediate safety, alert the manager/security or emergency services according to procedure, and avoid escalating alone.", 3],
    ["Continue service as if nothing happened.", 0],
    ["Record and post the event before seeking help.", 0],
  ], "Checks urgent safety escalation."),
);

bartenderQuestions.push(
  q("BT31", "technical", "Which ingredient set matches a classic Margarita?", [
    ["Tequila, orange liqueur, and fresh lime juice.", 3],
    ["Vodka, coffee liqueur, and cream.", 0],
    ["Gin, sweet vermouth, and Campari.", 0],
    ["Rum, coconut cream, and pineapple juice.", 0],
  ], "Foundational recipe check. The current house recipe and approved pour specifications control service."),
  q("BT32", "technical", "Which ingredient set matches a classic Mojito?", [
    ["Whiskey, lemon, and egg white.", 0],
    ["White rum, lime, mint, sugar, and soda water.", 3],
    ["Tequila, grapefruit, and salt only.", 0],
    ["Gin, dry vermouth, and olive brine.", 0],
  ], "Tests recognition of a common highball-style recipe; house specifications control."),
  q("BT33", "technical", "Which base combination belongs in an Old Fashioned?", [
    ["Whiskey, sugar, bitters, and a small dilution of water.", 3],
    ["Vodka, cranberry, and lime.", 0],
    ["Rum, cola, and cream.", 0],
    ["Tequila, orange juice, and grenadine.", 0],
  ], "Tests a foundational spirit-forward recipe."),
  q("BT34", "technical", "Which combination is standard for a Manhattan?", [
    ["Gin, dry vermouth, and orange juice.", 0],
    ["Rye or bourbon, sweet vermouth, and aromatic bitters.", 3],
    ["Rum, lime, and sugar.", 0],
    ["Vodka, ginger beer, and lime.", 0],
  ], "Tests recognition of a classic stirred whiskey cocktail."),
  q("BT35", "technical", "What are the core ingredients in a Dry Martini?", [
    ["Gin and dry vermouth, prepared to the approved specification.", 3],
    ["Bourbon and sweet vermouth.", 0],
    ["Rum and coconut cream.", 0],
    ["Tequila and triple sec.", 0],
  ], "Tests a classic stirred cocktail; vodka substitutions follow the guest request and house recipe."),
  q("BT36", "technical", "Which ingredients identify a Cosmopolitan?", [
    ["Citrus vodka, orange liqueur, cranberry, and lime.", 3],
    ["Gin, tonic, and cucumber only.", 0],
    ["Whiskey, cola, and bitters.", 0],
    ["Rum, mint, and soda only.", 0],
  ], "Tests recognition of a common contemporary classic."),
  q("BT37", "technical", "Which core ingredients make a Whiskey Sour?", [
    ["Whiskey, fresh lemon juice, and sugar/syrup; egg white only when the approved recipe calls for it.", 3],
    ["Whiskey, sweet vermouth, and Campari.", 0],
    ["Vodka, tomato juice, and spices.", 0],
    ["Gin, lime, and soda water.", 0],
  ], "Tests a common sour formula and awareness of optional egg ingredients."),
  q("BT38", "technical", "What is the classic ingredient set for a Moscow Mule?", [
    ["Vodka, ginger beer, and lime.", 3],
    ["Gin, champagne, and lemon.", 0],
    ["Tequila, pineapple, and coconut.", 0],
    ["Rum, cola, and orange liqueur.", 0],
  ], "Tests recognition of a common built drink."),
  q("BT39", "technical", "Which description best matches a Long Island Iced Tea?", [
    ["Multiple clear spirits plus orange liqueur, citrus/sweetener, and a cola finish according to the house recipe.", 3],
    ["Bourbon, mint, and sugar only.", 0],
    ["Gin and dry vermouth only.", 0],
    ["Rum, pineapple, and coconut cream only.", 0],
  ], "Tests recognition of a high-alcohol multi-spirit recipe and the need for exact house measures."),
  q("BT40", "technical", "Which ingredients form a classic Daiquiri?", [
    ["White rum, fresh lime juice, and sugar.", 3],
    ["Vodka, ginger beer, and lime.", 0],
    ["Tequila, grapefruit soda, and salt.", 0],
    ["Brandy, cream, and cacao.", 0],
  ], "Tests the classic rum sour, not the frozen flavored variation."),
  q("BT41", "technical", "Which ingredient set matches a classic Piña Colada?", [
    ["White rum, coconut cream, and pineapple juice.", 3],
    ["Gin, lemon, sugar, and soda.", 0],
    ["Whiskey, bitters, and sugar.", 0],
    ["Vodka, cranberry, and lime.", 0],
  ], "Tests recognition of a common tropical blended drink."),
  q("BT42", "technical", "What are the equal-part core ingredients of a classic Negroni?", [
    ["Gin, bitter Campari, and sweet red vermouth.", 3],
    ["Vodka, coffee liqueur, and espresso.", 0],
    ["Rum, lime, and sugar.", 0],
    ["Tequila, triple sec, and lime.", 0],
  ], "Tests recognition of a classic stirred aperitivo."),
  q("BT43", "technical", "Which ingredients identify a Tequila Sunrise?", [
    ["Tequila, orange juice, and grenadine.", 3],
    ["Tequila, tomato juice, and hot sauce.", 0],
    ["Rum, pineapple, and grenadine.", 0],
    ["Gin, orange liqueur, and lemon.", 0],
  ], "Tests a common built tequila drink and its layered finish."),
  q("BT44", "technical", "Which ingredients are used in a classic French 75?", [
    ["Gin, fresh lemon, sugar/syrup, and sparkling wine.", 3],
    ["Vodka, cranberry, and soda.", 0],
    ["Whiskey, sweet vermouth, and bitters.", 0],
    ["Rum, coconut cream, and pineapple.", 0],
  ], "Tests recognition of a common sparkling cocktail."),
  q("BT45", "technical", "The house recipe differs from a recipe you learned elsewhere. Which should you serve?", [
    ["Your personal version because it tastes better.", 0],
    ["The current approved house recipe and measured pour, while raising any concern with the bar manager.", 3],
    ["A different version for every guest.", 0],
    ["Whichever recipe uses more alcohol.", 0],
  ], "Confirms that standardized house recipes control actual service."),
);

const profileQuestions: Record<AssessmentProfile, AssessmentQuestion[]> = {
  host_cashier: hostCashier,
  server: serverQuestions,
  bartender: bartenderQuestions,
  ...expandedRoleQuestions,
};

for (const [profile, questions] of Object.entries(profileQuestions) as Array<[AssessmentProfile, AssessmentQuestion[]]>) {
  profileQuestions[profile] = questions.map((question) => ({
    ...question,
    sourceQuestionId: question.id,
    assessmentProfile: profile,
  }));
}

export const categoryLabels: Record<QuestionCategory, string> = {
  work_style: "Work Style & Reliability",
  communication: "Communication",
  problem_solving: "Customer Problem Solving",
  technical: "Role Technical Knowledge",
};

const behavioralBases = [
  ...workStyle.slice(0, 10),
  ...communication.slice(0, 10),
  ...problemSolving.slice(0, 10),
].map((question) => ({ ...question, sourceQuestionId: question.id }));

const behavioralContextLeads: QuestionContextLead[] = [
  "opening_preparation",
  "peak_service",
  "shift_handoff",
  "closing_duties",
];

function contextualForm(
  question: AssessmentQuestion,
  id: string,
  contextLead: QuestionContextLead,
  restaurantTags: string[] = [],
) {
  return {
    ...question,
    id,
    sourceQuestionId: question.sourceQuestionId || question.id,
    contextLead,
    restaurantTags,
  } satisfies AssessmentQuestion;
}

export const behavioralQuestionBank = behavioralBases.flatMap((question) => [
  question,
  ...behavioralContextLeads.map((contextLead, index) =>
    contextualForm(question, `${question.id}-B${index + 1}`, contextLead),
  ),
]);

const contextTags: Record<QuestionContextLead, string[]> = {
  opening_preparation: [],
  peak_service: ["high_volume"],
  shift_handoff: [],
  closing_duties: [],
  full_service: ["full_service", "casual"],
  fine_dining: ["upscale", "full_service"],
  counter_service: ["counter_service", "high_volume"],
  off_premise: ["off_premise"],
  buffet_service: ["buffet", "high_volume"],
  bar_service: ["bar"],
  seafood_service: ["seafood"],
  seafood_boil: ["seafood_boil", "seafood"],
  steakhouse_service: ["steakhouse", "full_service"],
  barbecue_service: ["barbecue"],
  sushi_service: ["sushi", "japanese"],
  hibachi_show: ["hibachi_show", "japanese"],
  hibachi_express: ["hibachi_express", "counter_service"],
  asian_kitchen: ["japanese", "chinese", "korean", "southeast_asian"],
  breakfast_service: ["breakfast"],
  event_service: ["events"],
  entry_supervised: [],
  experienced_peak: ["high_volume"],
  lead_quality: [],
};

const profileContextLeads: Record<AssessmentProfile, QuestionContextLead[]> = {
  host_cashier: ["full_service", "counter_service", "off_premise", "buffet_service", "event_service"],
  server: ["full_service", "fine_dining", "seafood_service", "seafood_boil", "steakhouse_service", "event_service"],
  bartender: ["bar_service", "fine_dining", "seafood_service", "event_service", "peak_service"],
  busser_runner: ["full_service", "buffet_service", "event_service", "peak_service", "closing_duties"],
  assistant_manager: ["full_service", "counter_service", "off_premise", "bar_service", "seafood_boil", "event_service"],
  cook: ["counter_service", "seafood_service", "seafood_boil", "steakhouse_service", "barbecue_service", "asian_kitchen", "breakfast_service", "hibachi_show", "hibachi_express"],
  sushi_cook: ["sushi_service", "fine_dining", "asian_kitchen", "peak_service", "off_premise"],
  cook_prep: ["counter_service", "seafood_service", "seafood_boil", "barbecue_service", "asian_kitchen", "breakfast_service", "event_service"],
  sushi_prep: ["sushi_service", "fine_dining", "asian_kitchen", "off_premise", "peak_service"],
  sushi_chef: ["sushi_service", "fine_dining", "asian_kitchen", "event_service", "peak_service"],
};

const technicalBases = (Object.entries(profileQuestions) as Array<[AssessmentProfile, AssessmentQuestion[]]>)
  .flatMap(([, questions]) => questions);

const primaryTechnicalForms = technicalBases.map((question, index) => {
  const profile = question.assessmentProfile!;
  const leads = profileContextLeads[profile];
  const contextLead = leads[index % leads.length];
  return contextualForm(question, `${question.id}-T1`, contextLead, contextTags[contextLead]);
});

const experienceTechnicalForms = (Object.entries(profileQuestions) as Array<[AssessmentProfile, AssessmentQuestion[]]>)
  .flatMap(([, questions]) => questions.slice(0, 10))
  .map((question, index) => {
    const experienceLeads: QuestionContextLead[] = ["entry_supervised", "experienced_peak", "lead_quality"];
    const contextLead = experienceLeads[index % experienceLeads.length];
    return contextualForm(question, `${question.id}-T2`, contextLead, contextTags[contextLead]);
  });

export const technicalQuestionBank = [
  ...technicalBases,
  ...primaryTechnicalForms,
  ...experienceTechnicalForms,
];

function hashSeed(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededRandom(seed: string) {
  let value = hashSeed(seed) || 1;
  return () => {
    value += 0x6d2b79f5;
    let current = value;
    current = Math.imul(current ^ (current >>> 15), current | 1);
    current ^= current + Math.imul(current ^ (current >>> 7), current | 61);
    return ((current ^ (current >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededShuffle<T>(items: readonly T[], seed: string) {
  const random = seededRandom(seed);
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function groupBySource(questions: AssessmentQuestion[]) {
  const groups = new Map<string, AssessmentQuestion[]>();
  for (const question of questions) {
    const sourceId = question.sourceQuestionId || question.id;
    groups.set(sourceId, [...(groups.get(sourceId) || []), question]);
  }
  return groups;
}

const behavioralFormsBySource = groupBySource(behavioralQuestionBank);
const technicalFormsBySource = groupBySource(technicalQuestionBank);
const questionById = new Map(
  [...behavioralQuestionBank, ...technicalQuestionBank].map((question) => [question.id, question] as const),
);

function chooseBehavioralForms(seed: string) {
  return seededShuffle(behavioralBases, `${seed}:behavioral-order`).map((base, index) => {
    const forms = behavioralFormsBySource.get(base.id)!;
    return seededShuffle(forms, `${seed}:${base.id}:${index}`)[0];
  });
}

function preferredExperienceLead(level: ExperienceLevel): QuestionContextLead {
  if (level === "none" || level === "under_1") return "entry_supervised";
  if (level === "over_5") return "lead_quality";
  return "experienced_peak";
}

const requiredSpecificContextTag: Partial<Record<QuestionContextLead, string>> = {
  seafood_service: "seafood",
  seafood_boil: "seafood_boil",
  steakhouse_service: "steakhouse",
  barbecue_service: "barbecue",
  sushi_service: "sushi",
  hibachi_show: "hibachi_show",
  hibachi_express: "hibachi_express",
  breakfast_service: "breakfast",
  event_service: "events",
  bar_service: "bar",
  off_premise: "off_premise",
  buffet_service: "buffet",
};

function selectionTags(role: CandidateRole, selection: AssessmentSelection) {
  const tags = new Set(restaurantConceptById(selection.restaurantConcept).tags);
  const roleValue = String(role);
  if (/seafood|oyster|raw_bar|fish_cutter/.test(roleValue)) tags.add("seafood");
  if (/seafood_boil/.test(roleValue)) tags.add("seafood_boil");
  if (/sushi|omakase|sashimi/.test(roleValue)) { tags.add("sushi"); tags.add("japanese"); }
  if (/hibachi_express/.test(roleValue)) { tags.add("hibachi_express"); tags.add("counter_service"); }
  if (/hibachi_show|teppanyaki|head_hibachi|^hibachi_chef$/.test(roleValue)) { tags.add("hibachi_show"); tags.add("japanese"); }
  if (/steak|broiler/.test(roleValue)) tags.add("steakhouse");
  if (/bbq|pitmaster/.test(roleValue)) tags.add("barbecue");
  if (/breakfast/.test(roleValue)) tags.add("breakfast");
  if (/banquet|catering|event/.test(roleValue)) tags.add("events");
  if (/bartender|barback|sommelier|wine_server/.test(roleValue)) tags.add("bar");
  return tags;
}

function chooseTechnicalForm(
  base: AssessmentQuestion,
  role: CandidateRole,
  selection: AssessmentSelection,
  index: number,
) {
  const conceptTags = selectionTags(role, selection);
  const preferredLead = preferredExperienceLead(selection.experienceLevel);
  const random = seededRandom(`${selection.seed}:${base.id}:${index}:form`);
  return [...technicalFormsBySource.get(base.id)!]
    .map((form) => {
      const matchingTags = (form.restaurantTags || []).filter((tag) => conceptTags.has(tag)).length;
      const contextScore = matchingTags * 20;
      const requiredTag = form.contextLead ? requiredSpecificContextTag[form.contextLead] : undefined;
      const mismatchPenalty = requiredTag && !conceptTags.has(requiredTag)
        ? -60
        : (form.restaurantTags || []).length > 0 && matchingTags === 0 ? -24 : 0;
      const experienceScore = form.contextLead === preferredLead ? 16 : 0;
      const neutralBaseScore = form.contextLead ? 0 : 2;
      return { form, score: contextScore + mismatchPenalty + experienceScore + neutralBaseScore + random() * 5 };
    })
    .sort((left, right) => right.score - left.score)[0].form;
}

function chooseTechnicalQuestions(role: CandidateRole, selection: AssessmentSelection) {
  const position = positionForRole(role);
  const tags = selectionTags(role, selection);
  const shuffledPrimary = seededShuffle(profileQuestions[position.profile], `${selection.seed}:technical-primary`);
  const contextualPrimary = shuffledPrimary.filter((question) =>
    (technicalFormsBySource.get(question.id) || []).some((form) => {
      const requiredTag = form.contextLead ? requiredSpecificContextTag[form.contextLead] : undefined;
      return requiredTag ? tags.has(requiredTag) : false;
    }),
  ).slice(0, 8);
  const contextualIds = new Set(contextualPrimary.map((question) => question.id));
  const primary = [
    ...contextualPrimary,
    ...shuffledPrimary.filter((question) => !contextualIds.has(question.id)),
  ].slice(0, 30);
  const relatedProfiles = position.relatedProfiles?.length
    ? position.relatedProfiles
    : ([position.profile] as AssessmentProfile[]);
  const relatedPool = relatedProfiles.flatMap((profile) => profileQuestions[profile]);
  const primaryIds = new Set(primary.map((question) => question.id));
  const related = seededShuffle(
    relatedPool.filter((question) => !primaryIds.has(question.id)),
    `${selection.seed}:technical-related`,
  ).slice(0, 15);
  const selectedBases = [...primary, ...related];
  if (selectedBases.length !== 45) {
    throw new Error(`Technical selection for ${role} must contain exactly 45 competency roots.`);
  }
  return seededShuffle(
    selectedBases.map((base, index) => chooseTechnicalForm(base, role, selection, index)),
    `${selection.seed}:technical-order`,
  );
}

export function getQuestionById(questionId: string) {
  return questionById.get(questionId);
}

export function getAssessmentQuestions(role: CandidateRole, selection?: AssessmentSelection) {
  if (!selection) {
    const profile = positionForRole(role).profile;
    return [...behavioralBases, ...profileQuestions[profile]];
  }
  if (familyForRole(role).id !== selection.jobFamily) {
    throw new Error("The selected position does not belong to the selected job family.");
  }
  return [
    ...chooseBehavioralForms(selection.seed),
    ...chooseTechnicalQuestions(role, selection),
  ];
}

export function questionContextLeadText(contextLead: QuestionContextLead) {
  const labels: Record<QuestionContextLead, string> = {
    opening_preparation: "During opening preparation:",
    peak_service: "During peak service:",
    shift_handoff: "During a shift handoff:",
    closing_duties: "During closing duties:",
    full_service: "In a full-service restaurant:",
    fine_dining: "In an upscale or fine-dining setting:",
    counter_service: "In a high-volume counter-service restaurant:",
    off_premise: "For takeout or delivery service:",
    buffet_service: "In buffet or self-service operations:",
    bar_service: "During bar service:",
    seafood_service: "In a seafood restaurant:",
    seafood_boil: "In a seafood-boil restaurant:",
    steakhouse_service: "In a steakhouse:",
    barbecue_service: "In barbecue or smokehouse operations:",
    sushi_service: "In sushi service:",
    hibachi_show: "In a hibachi-show or teppanyaki restaurant:",
    hibachi_express: "In a hibachi-express operation:",
    asian_kitchen: "In an Asian kitchen concept:",
    breakfast_service: "During breakfast or brunch service:",
    event_service: "During banquet, catering, or event service:",
    entry_supervised: "For an entry-level employee working under supervision:",
    experienced_peak: "For an experienced employee during a busy shift:",
    lead_quality: "For a lead employee responsible for quality control:",
  };
  return labels[contextLead];
}

export function questionPrompt(question: Pick<AssessmentQuestion, "prompt" | "contextLead">) {
  return question.contextLead
    ? `${questionContextLeadText(question.contextLead)} ${question.prompt}`
    : question.prompt;
}

export function toPublicQuestion(question: AssessmentQuestion): PublicQuestion {
  return {
    id: question.id,
    category: question.category,
    prompt: questionPrompt(question),
    options: question.options.map(({ id, text }) => ({ id, text })),
    sourceQuestionId: question.sourceQuestionId || question.id,
    contextLead: question.contextLead,
  };
}

export const TEST_VERSION = "2026.09.4";
