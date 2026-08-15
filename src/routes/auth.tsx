import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { User, IdCard, Mail, Loader2, Lock, MapPin, Users, Phone, ArrowLeft, ArrowRight, Check, Eye, EyeOff, PartyPopper, AtSign } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { supabase } from "@/integrations/supabase/client";
import { createRegistration, updateMyProfile, getMyRegistrations, type RoleValue } from "@/lib/registrations.functions";
import { lookupLoginEmail, checkUsernameAvailable } from "@/lib/login-lookup.functions";
import { confirmSignup } from "@/lib/signup.functions";
import { LocationPicker, EMPTY_LOCATION, type LocationValue } from "@/components/LocationPicker";
import { PasswordStrength } from "@/components/PasswordStrength";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } =>
    typeof search.redirect === "string" ? { redirect: search.redirect } : {},
  head: () => ({
    meta: [
      { title: "Join Us or Log In | Buy Africa Build Africa (BABA)" },
      {
        name: "description",
        content:
          "Join Buy Africa Build Africa (BABA). Pick your work, add your name and phone, then choose your password.",
      },
      { property: "og:title", content: "Join Us or Log In | Buy Africa Build Africa" },
      {
        property: "og:description",
        content: "Pick your work, add your name and phone, then choose your password.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/auth" }],
  }),

  component: AuthPage,
});

/* ------------------------------ professions ------------------------------ */

type ProfessionOption = {
  key: string;
  label: string; // "I am ..."
  role: RoleValue;
  trade?: string;
  example: string; // ego-glazing example for "what have you done?"
};

/** Every profession we celebrate — the more, the merrier. Nobody is left out. */
const PROFESSIONS: ProfessionOption[] = [
  // The big ones
  { key: "architect", label: "I am an Architect", role: "professional_exp", example: "e.g. I have designed a beautiful building that people love." },
  { key: "engineer", label: "I am an Engineer", role: "professional_exp", example: "e.g. I have engineered structures that serve my community." },
  { key: "interior-designer", label: "I am an Interior Designer", role: "professional_exp", example: "e.g. I have turned rooms into stunning, welcoming spaces." },
  { key: "quantity-surveyor", label: "I am a Quantity Surveyor", role: "professional_exp", example: "e.g. I have kept big projects on budget, down to the last shilling." },
  { key: "project-manager", label: "I am a Project Manager", role: "professional_exp", example: "e.g. I have led teams that delivered projects on time." },
  { key: "contractor", label: "I am a Contractor", role: "professional_exp", example: "e.g. I have built projects from the ground up." },
  // The hands — jobs Africa depends on
  { key: "welder", label: "I am a Welder", role: "artisan", trade: "welder", example: "e.g. I have welded gates and structures that are strong, clean and artistic." },
  { key: "plumber", label: "I am a Plumber", role: "artisan", trade: "plumber", example: "e.g. I have done neat, reliable plumbing that never leaks." },
  { key: "mason", label: "I am a Mason", role: "artisan", trade: "mason", example: "e.g. I have laid bricks and stone that stand tall for years." },
  { key: "construction", label: "I am in Construction", role: "artisan", trade: "construction", example: "e.g. I have worked on building sites and helped put up homes, shops and offices." },
  { key: "electrician", label: "I am an Electrician", role: "artisan", trade: "electrician", example: "e.g. I have wired homes and shops safely and neatly." },
  { key: "painter", label: "I am a Painter", role: "artisan", trade: "painter", example: "e.g. I have given walls beautiful, smooth finishes." },
  { key: "tiler", label: "I am a Tiler", role: "artisan", trade: "tiler", example: "e.g. I have done beautiful bathroom and floor tiling." },
  { key: "carpenter", label: "I am a Carpenter", role: "artisan", trade: "carpenter", example: "e.g. I have crafted furniture and fittings that last." },
  { key: "gypsum-fabricator", label: "I am a Gypsum Fabricator", role: "artisan", trade: "gypsum_installer", example: "e.g. I have made ceilings and partitions that look elegant." },
  { key: "steel-fixer", label: "I am a Steel Fixer", role: "artisan", trade: "other", example: "e.g. I have tied the steel that holds strong buildings together." },
  { key: "roofer", label: "I am a Roofer", role: "artisan", trade: "other", example: "e.g. I have put up roofs that keep families safe and dry." },
  { key: "glass-aluminium", label: "I am a Glass & Aluminium Fitter", role: "artisan", trade: "other", example: "e.g. I have fitted windows and doors that look sharp." },
  { key: "metal-fabricator", label: "I am a Metal Fabricator", role: "artisan", trade: "other", example: "e.g. I have shaped metal into useful, beautiful things." },
  { key: "landscaper", label: "I am a Landscaper", role: "artisan", trade: "other", example: "e.g. I have turned bare ground into beautiful green spaces." },
  // Learners
  { key: "student", label: "I am a Student", role: "professional_young", example: "e.g. I am learning my craft and hungry to grow." },
  { key: "other", label: "I do something else (type it below)", role: "artisan", trade: "other", example: "Tell us something you have made or done that you are proud of." },
];

/** Highest tier wins the role: professional > artisan > student. */
function deriveRole(keys: string[]): RoleValue {
  const roles = keys
    .map((k) => PROFESSIONS.find((p) => p.key === k)?.role)
    .filter(Boolean) as RoleValue[];
  if (roles.includes("professional_exp")) return "professional_exp";
  if (roles.includes("artisan")) return "artisan";
  return "professional_young";
}

const EDUCATION_OPTIONS = [
  "Primary school",
  "Secondary school",
  "Certificate",
  "Diploma",
  "Bachelor's degree",
  "Master's degree",
  "PhD / Doctorate",
];
const EMPLOYMENT_OPTIONS = ["Employed", "Business owner / Entrepreneur", "Freelancer", "Student", "Other"];
const YEARS_OPTIONS = ["Less than 1 year", "1–3 years", "3–5 years", "5–10 years", "More than 10 years"];

function sanitizeRedirect(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

function idToEmail(id: string): string {
  const clean = id.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  return `id${clean}@baba.local`;
}


/** Members can join without an ID number, so build a login address from the name.
 *  Deterministic (no random suffix) so a retried signup lands on the same
 *  account instead of spawning duplicates. */
function nameToEmail(name: string): string {
  const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 24) || "member";
  return `${slug}@baba.local`;
}


function AuthPage() {
  const navigate = useNavigate();
  const submitRegistration = useServerFn(createRegistration);
  const saveProfile = useServerFn(updateMyProfile);
  const findLogin = useServerFn(lookupLoginEmail);
  const checkUsername = useServerFn(checkUsernameAvailable);
  const confirmSignupFn = useServerFn(confirmSignup);
  const getMyRegistrationsFn = useServerFn(getMyRegistrations);

  const [mode, setMode] = useState<"join" | "signin">("join");
  const [intent, setIntent] = useState<"member" | "partner">("member");
  const [fullName, setFullName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [usernameState, setUsernameState] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [idNumber, setIdNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [reviewPassword, setReviewPassword] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [otherProfession, setOtherProfession] = useState("");
  const [education, setEducation] = useState("");
  const [employment, setEmployment] = useState("");
  const [years, setYears] = useState("");
  const [lookingFor, setLookingFor] = useState("");
  const [partnerMessage, setPartnerMessage] = useState("");
  const [location, setLocation] = useState<LocationValue>(EMPTY_LOCATION);
  const [askForId, setAskForId] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  // member join wizard: 1 account, 2 what you do, 3 about you, 4 your work, 5 review, 6 welcome
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showReviewPassword, setShowReviewPassword] = useState(false);
  // Fresh Google sign-in: the auth account exists but the member setup was
  // never finished — walk the whole wizard with the Google name locked.
  const [googleSetup, setGoogleSetup] = useState<{ email: string; lockedName: string } | null>(null);

  // Arriving from "Become a Partner" opens the organisation form straight away.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("intent") === "partner") {
      setIntent("partner");
    }
  }, []);

  const chosenProfessions = selected
    .map((k) => PROFESSIONS.find((p) => p.key === k))
    .filter(Boolean) as ProfessionOption[];
  const primaryProfession = chosenProfessions[0];
  const isOther = selected.includes("other");
  const professionLabel = (p: ProfessionOption) =>
    p.key === "other" && otherProfession.trim() ? otherProfession.trim() : p.label;
  const chooseProfession = (key: string) => {
    setSelected(key ? [key] : []);
  };
  const role: RoleValue =
    intent === "partner" ? "corporate" : deriveRole(selected);
  const artisanType =
    intent === "member"
      ? (chosenProfessions.find((p) => p.trade)?.trade ?? (selected.length ? "other" : undefined))
      : undefined;

  // First + last name are the two required names; middle name is optional.
  // The combined full name is what the database stores — always "First [Middle] Last".
  const memberFullName = [firstName.trim(), middleName.trim(), lastName.trim()].filter(Boolean).join(" ");

  const redirectTo = () =>
    sanitizeRedirect(new URLSearchParams(window.location.search).get("redirect"));

  // Common African dial codes → country name (matches AFRICA_COUNTRIES names).
  const DIAL_TO_COUNTRY: Record<string, string> = {
    "+254": "Kenya", "+255": "Tanzania", "+256": "Uganda", "+250": "Rwanda",
    "+234": "Nigeria", "+233": "Ghana", "+27": "South Africa", "+251": "Ethiopia",
    "+20": "Egypt", "+212": "Morocco", "+216": "Tunisia", "+213": "Algeria",
    "+237": "Cameroon", "+242": "Congo (Republic)", "+243": "Congo (DRC)",
    "+244": "Angola", "+260": "Zambia", "+263": "Zimbabwe", "+265": "Malawi",
    "+266": "Lesotho", "+267": "Botswana", "+264": "Namibia", "+258": "Mozambique",
    "+252": "Somalia", "+249": "Sudan", "+211": "South Sudan", "+257": "Burundi",
    "+253": "Djibouti", "+220": "Gambia", "+224": "Guinea", "+225": "Côte d'Ivoire",
    "+226": "Burkina Faso", "+228": "Togo", "+229": "Benin", "+230": "Mauritius",
    "+231": "Liberia", "+232": "Sierra Leone", "+235": "Chad", "+236": "Central African Republic",
    "+238": "Cabo Verde", "+239": "São Tomé and Príncipe", "+240": "Equatorial Guinea",
    "+241": "Gabon", "+245": "Guinea-Bissau", "+248": "Seychelles", "+268": "Eswatini",
    "+269": "Comoros", "+291": "Eritrea", "+222": "Mauritania",
  };

  /** Detect the country from a phone number's dial code (e.g. +254 → Kenya). */
  const setCountryFromPhone = (phoneValue: string) => {
    const digits = phoneValue.trim().replace(/[^+0-9]/g, "");
    if (!digits.startsWith("+")) return;
    // Try longest prefixes first (e.g. +254 before +25).
    for (let len = 5; len >= 2; len--) {
      const prefix = digits.slice(0, len);
      const country = DIAL_TO_COUNTRY[prefix];
      if (country) {
        setLocation((prev) => ({ ...prev, country: prev.country || country }));
        return;
      }
    }
  };

  /** Live username availability — debounced, never blocks typing. */
  useEffect(() => {
    const u = username.trim();
    if (u.length < 2) {
      setUsernameState("idle");
      return;
    }
    setUsernameState("checking");
    const t = setTimeout(async () => {
      try {
        const res = await checkUsername({ data: { username: u } });
        setUsernameState(res.available ? "available" : "taken");
      } catch {
        setUsernameState("idle");
      }
    }, 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const signInWithGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}${redirectTo()}`,
        },
      });
      if (error) throw error;
      // OAuth redirects the browser — nothing else to do here.
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message.includes("provider is not enabled")
            ? "Google sign-in is not switched on yet — log in with your name, ID or Gmail for now."
            : err.message
          : "Could not start Google sign-in. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const finishRegistrationSetup = async (name: string, id: string, phoneNumber: string, loc: LocationValue) => {
    if (intent === "partner") {
      await submitRegistration({
        data: {
          role: "corporate",
          data: {
            fullName: name,
            corporateName: name,
            email: email.trim() || null,
            phone: phoneNumber,
            lookingFor: lookingFor.trim() ? [lookingFor.trim()] : [],
            partnerMessage: partnerMessage.trim() || null,
            occupation: "Partner",
            category: "Partner",
          },
        },
      });
      await saveProfile({
        data: { full_name: name, email: email.trim() || undefined, phone: phoneNumber },
      });
      return;
    }
    const label =
      isOther && otherProfession.trim()
        ? otherProfession.trim()
        : primaryProfession
          ? professionLabel(primaryProfession)
          : "Member";
    await submitRegistration({
      data: {
        role,
        artisan_type: artisanType,
        data: {
          fullName: name,
          firstName: firstName.trim() || null,
          middleName: middleName.trim() || null,
          lastName: lastName.trim() || null,
          username: username.trim() || null,
          nationalId: id,
          phone: phoneNumber,
          email: email.trim() || null,
          category: label,
          occupation: label,
          trade: role === "artisan" ? label : undefined,
          professions: chosenProfessions.map((p) => professionLabel(p)),
          education: education || null,
          employmentStatus: employment || null,
          yearsField: years || null,
          country: loc.country,
          city: loc.city.trim(),
          area: loc.area.trim(),
          location: [loc.area, loc.city, loc.country].filter(Boolean).join(", "),
        },
      },
    });
    await saveProfile({
      data: {
        full_name: name,
        username: username.trim() || undefined,
        email: email.trim() || undefined,
        phone: phoneNumber,
        country: loc.country || undefined,
        city: loc.city.trim() || undefined,
        area: loc.area.trim() || undefined,
        location: [loc.area, loc.city, loc.country].filter(Boolean).join(", ") || undefined,
      },
    });
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const session = data.session;
      if (!session) return;
      const provider = session.user.app_metadata?.provider;
      if (provider === "google") {
        try {
          const regs = await getMyRegistrationsFn();
          if (regs.length > 0) {
            navigate({ to: redirectTo() });
            return;
          }
        } catch {
          // If the check fails, walk them through setup instead of bouncing
          // them somewhere they cannot use.
        }
        // Fresh Google sign-in — run the whole wizard, name locked from Google.
        const gName = (session.user.user_metadata?.full_name as string) ?? "";
        setGoogleSetup({ email: session.user.email ?? "", lockedName: gName });
        setMode("join");
        setIntent("member");
        setFullName(gName);
        setEmail(session.user.email ?? "");
        setStep(2); // Google members have no account step — start at "What do you do?"
        return;
      }
      navigate({ to: redirectTo() });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Validate the current wizard slide. Returns an error message or null. */
  const validateStep = (s: number): string | null => {
    if (s === 1) {
      if (!firstName.trim() || !lastName.trim()) return "Please type your first and last name.";
      const u = username.trim();
      if (u.length < 2) return "Please type a username — your name, or something unique to you.";
      if (usernameState === "taken") return "That username has been taken — try adding a middle name or a number.";
      if (!password || password.length < 6) {
        return "Please type your password (6 letters or numbers or more).";
      }
      if (password !== confirmPassword) {
        return "The two passwords are not the same. Please type them again.";
      }
    }
    if (s === 2) {
      if (selected.length === 0) return "Please pick what you do.";
      if (isOther && !otherProfession.trim()) return "Please type the work you do.";
    }
    if (s === 3) {
      if (googleSetup && !fullName.trim()) return "Please type your full name.";
      if (idNumber.trim() && idNumber.replace(/[^a-zA-Z0-9]/g, "").length < 4) {
        return "That National Identification No looks too short. Please type the full number.";
      }
      if (!phone.trim()) return "Please type your phone number.";
      if (phone.replace(/[^0-9]/g, "").length < 9) {
        return "That phone number looks too short - please type it fully, e.g. 0712 345 678.";
      }
    }
    if (s === 5 && !googleSetup) {
      if (reviewPassword !== password) {
        return "Type your password again to confirm everything before it saves.";
      }
    }
    return null;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");

    // Member wizard: advance one slide per submit until the review step.
    if (mode === "join" && intent === "member" && step < 5) {
      const stepErr = validateStep(step);
      if (stepErr) return setError(stepErr);
      setStep(step + 1);
      return;
    }

    // Google sign-in already created the auth account — just finish setup.
    if (googleSetup) {
      const gName = fullName.trim();
      const gId = idNumber.trim();
      if (!gName) return setError("Please type your full name.");
      if (!phone.trim()) return setError("Please type your phone number.");
      if (phone.replace(/[^0-9]/g, "").length < 9) {
        return setError("That phone number looks too short - please type it fully, e.g. 0712 345 678.");
      }
      if (selected.length === 0) return setError("Please pick what you do — tap at least one.");
      if (isOther && !otherProfession.trim()) return setError("Please type the work you do.");
      if (gId && gId.replace(/[^a-zA-Z0-9]/g, "").length < 4) {
        return setError("That National Identification No looks too short. Please type the full number.");
      }
      setLoading(true);
      try {
        await finishRegistrationSetup(gName, gId, phone, location);
        setStep(6);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
      return;
    }

    const name = mode === "join" && intent === "member" && !googleSetup ? memberFullName : fullName.trim();
    const id = idNumber.trim();
    const pwd = password;
    if (mode === "signin") {
      if (!username.trim() && !name) return setError("Please type your username, email, name or ID number.");
    } else if (!name) {
      return setError("Please type your full name.");
    }
    if (mode === "join") {
      if (!phone.trim()) return setError("Please type your phone number.");
      if (phone.replace(/[^0-9]/g, "").length < 9) {
        return setError("That phone number looks too short - please type it fully, e.g. 0712 345 678.");
      }
    }
    if (!pwd || pwd.length < 6) {
      return setError("Please type your password (6 letters or numbers or more).");
    }
    if (mode === "join" && intent === "member") {
      const u = username.trim();
      if (u.length < 2) return setError("Please type a username — your name, or something unique to you.");
      if (usernameState === "taken") return setError("That username has been taken — try adding a middle name or a number.");
      if (selected.length === 0) {
        return setError("Please pick what you do — tap at least one.");
      }
      if (isOther && !otherProfession.trim()) {
        return setError("Please type the work you do.");
      }
      if (id && id.replace(/[^a-zA-Z0-9]/g, "").length < 4) {
        return setError("That National Identification No looks too short. Please type the full number.");
      }
      if (pwd !== confirmPassword) {
        return setError("The two passwords are not the same. Please type them again.");
      }
      if (reviewPassword !== pwd) {
        return setError("Type your password again to confirm everything before it saves.");
      }
    }
    if (mode === "join" && intent === "partner") {
      if (!email.trim()) {
        return setError("Please type your email so we can reach you.");
      }
      if (pwd !== confirmPassword) {
        return setError("The two passwords are not the same. Please type them again.");
      }
    }


    setLoading(true);
    try {
      const destination = redirectTo();
      const signInWith = (loginEmail: string, p: string) =>
        supabase.auth.signInWithPassword({ email: loginEmail, password: p });

      if (mode === "signin") {
        if (!username.trim() && !name) {
          throw new Error("Please type your username, email, name or ID number.");
        }
        const found = await findLogin({
          data: { fullName: username.trim() || name, nationalId: id || undefined },
        });
        if (found.needsId) {
          setAskForId(true);
          throw new Error(
            "More than one person uses that name. Please also type your National Identification No.",
          );
        }
        if (!found.email) {
          throw new Error(
            "We could not find that name. Check the spelling, or tap Join us to make an account.",
          );
        }
        const res = await signInWith(found.email, pwd);
        if (res.error) {
          throw new Error("Wrong password. Tap “Forgot your password?” below to get a new one.");
        }
        await navigate({ to: destination, replace: true });
        return;
      }

      // Prefer the member's real email when provided (so password resets land
      // in a real inbox); fall back to a synthetic internal address from the
      // name (deterministic — a retried signup lands on the same account).
      const authEmail = email.trim()
        ? email.trim().toLowerCase()
        : id
          ? idToEmail(id)
          : nameToEmail(name);

      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
        email: authEmail,
        password: pwd,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            full_name: name,
            username: username.trim() || null,
            national_id: id || null,
            phone: phone.trim() || null,
            contact_email: email.trim() || null,
            category: isOther && otherProfession.trim()
              ? otherProfession.trim()
              : (primaryProfession ? professionLabel(primaryProfession) : "Member"),
            professions: chosenProfessions.map((p) => professionLabel(p)),
            country: location.country,
            city: location.city.trim(),
            area: location.area.trim(),
          },
        },
      });

      if (signUpErr) {
        if (/already registered|already exists|user already/i.test(signUpErr.message)) {
          let existing = await signInWith(authEmail, pwd);
          if (existing.error && authEmail.endsWith("@baba.local")) {
            // Stale unconfirmed account from an earlier attempt — confirm it
            // server-side, then sign in.
            try {
              const confirm = await confirmSignupFn({ data: { email: authEmail } });
              if (confirm.ok) existing = await signInWith(authEmail, pwd);
            } catch {
              // Fall through to the friendly error below.
            }
          }
          if (existing.error) {
            throw new Error(
              "You already have an account. Tap “Log in” and use your full name and password.",
            );
          }
          // Heal ghost accounts: an earlier attempt may have created the login
          // but not the member record. Re-running setup is safe — it updates
          // the existing registration instead of duplicating it.
          try {
            await finishRegistrationSetup(name, id, phone, location);
          } catch {
            // The login works regardless; details can be finished in the profile page.
          }
          setNotice("You are already a member — we have logged you in. Welcome back!");
          await navigate({ to: destination, replace: true });
          return;
        }
        throw signUpErr;
      }

      if (!signUpData.session) {
        // Confirmation emails are unreliable for some providers, so we confirm
        // every fresh account server-side and log the member in right away.
        // Nobody is ever blocked waiting for an email link.
        let signedIn = false;
        if (signUpData.user) {
          try {
            const confirm = await confirmSignupFn({
              data: { userId: signUpData.user.id, email: authEmail },
            });
            if (confirm.ok) {
              const res = await signInWith(authEmail, pwd);
              signedIn = !res.error;
            }
          } catch {
            // Ignore — the member record is still saved below.
          }
        }
        try {
          await finishRegistrationSetup(name, id, phone, location);
        } catch {
          // The account exists; details can be finished on the profile page.
        }
        if (!signedIn) {
          setNotice(
            "Your account was created. Please tap Log in and try again in a moment.",
          );
          setLoading(false);
          return;
        }
        // Signed in — fall through to the welcome screen.
      }

      try {
        await finishRegistrationSetup(name, id, phone, location);
      } catch {
        // The account exists; if saving details failed the member can finish
        // them on their profile page.
      }
      setStep(6);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const wizardStepLabels = googleSetup
    ? { 2: "What You Do", 3: "About You", 4: "Your Work", 5: "Check & Confirm", 6: "Welcome" }
    : { 1: "Your Account", 2: "What You Do", 3: "About You", 4: "Your Work", 5: "Check & Confirm", 6: "Welcome" };
  const wizardDots = googleSetup ? [2, 3, 4, 5, 6] : [1, 2, 3, 4, 5, 6];

  return (
    <PageShell>
      <section className="mx-auto max-w-2xl px-5 py-16 lg:px-8">
        <div className="text-center">
          <h1 className="font-display text-3xl font-extrabold text-baba-blue">
            {mode === "join"
              ? intent === "member"
                ? "Join us"
                : "Partner with us"
              : "Welcome back"}
          </h1>
          <p className="mt-2 text-baba-slate/70">
            {mode === "join"
              ? intent === "member"
                ? "First your account — then a couple of quick questions about your work."
                : "Tell us who you are and what you want to do with us — we are all ears."
              : "Log in with your username, email, name, or ID number — and your password."}
          </p>
        </div>

        {mode === "join" && (
          <div className="mt-6">
            <button
              type="button"
              onClick={() => {
                setIntent("member");
                setSelected([]);
                setOtherProfession("");
              }}
              className={`flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left transition-colors ${
                intent === "member"
                  ? "border-baba-blue bg-baba-blue/5"
                  : "border-baba-blue/15 hover:border-baba-blue/40"
              }`}
            >
              <Users className="h-5 w-5 text-baba-blue" />
              <span>
                <span className="block text-sm font-bold text-baba-slate">Join us</span>
                <span className="block text-xs text-baba-slate/60">I am working or studying</span>
              </span>
            </button>
          </div>
        )}

        <form onSubmit={submit} className="mt-8 grid gap-4">
          {mode === "join" && intent === "member" && step < 6 && (
            <>
              {/* wizard progress */}
              <div className="flex items-center justify-center gap-2">
                {wizardDots.map((s) => (
                  <span
                    key={s}
                    className={`h-2 rounded-full transition-all ${step === s ? "w-8 bg-baba-blue" : step > s ? "w-2 bg-baba-copper" : "w-2 bg-baba-blue/20"}`}
                  />
                ))}
              </div>
              <div className="text-center text-xs font-bold uppercase tracking-wide text-baba-slate/60">
                Step {googleSetup ? step - 1 : step} of {googleSetup ? 5 : 6} — {wizardStepLabels[step as keyof typeof wizardStepLabels]}
              </div>
            </>
          )}

          {mode === "join" && intent === "member" && !googleSetup && step === 1 && (
            <div className="rounded-2xl border border-baba-blue/10 bg-card p-6">
              <div className="mb-4 text-center">
                <h2 className="font-display text-xl font-bold text-baba-slate">Your account</h2>
                <p className="mt-1 text-sm text-baba-slate/60">
                  Your name, a username that is yours, and a password you can handle.
                </p>
              </div>
              <div className="grid gap-4">
                <label className="grid gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">First name</span>
                  <div className="flex items-center gap-2 rounded-lg border border-input bg-card px-3.5 focus-within:border-baba-blue">
                    <User className="h-4 w-4 text-baba-slate/40" />
                    <input
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      autoComplete="given-name"
                      className="w-full bg-transparent py-2.5 text-sm text-baba-slate focus:outline-none"
                      placeholder="e.g. Jane"
                    />
                  </div>
                </label>
                <label className="grid gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">
                    Middle name <span className="font-normal normal-case text-baba-slate/50">(optional)</span>
                  </span>
                  <div className="flex items-center gap-2 rounded-lg border border-input bg-card px-3.5 focus-within:border-baba-blue">
                    <User className="h-4 w-4 text-baba-slate/40" />
                    <input
                      value={middleName}
                      onChange={(e) => setMiddleName(e.target.value)}
                      autoComplete="additional-name"
                      className="w-full bg-transparent py-2.5 text-sm text-baba-slate focus:outline-none"
                      placeholder="e.g. Akinyi (if you have one)"
                    />
                  </div>
                </label>
                <label className="grid gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">Last name</span>
                  <div className="flex items-center gap-2 rounded-lg border border-input bg-card px-3.5 focus-within:border-baba-blue">
                    <User className="h-4 w-4 text-baba-slate/40" />
                    <input
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      autoComplete="family-name"
                      className="w-full bg-transparent py-2.5 text-sm text-baba-slate focus:outline-none"
                      placeholder="e.g. Wanjiru"
                    />
                  </div>
                </label>
                <span className="text-[0.7rem] text-baba-slate/50">
                  First and last name are enough. If you add a middle name, it is stored as part of your
                  full name — nothing gets lost.
                </span>
                <label className="grid gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">Username</span>
                  <div className="flex items-center gap-2 rounded-lg border border-input bg-card px-3.5 focus-within:border-baba-blue">
                    <AtSign className="h-4 w-4 text-baba-slate/40" />
                    <input
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoComplete="username"
                      className="w-full bg-transparent py-2.5 text-sm text-baba-slate focus:outline-none"
                      placeholder="e.g. JaneWanjiru or jane.wanjiru"
                    />
                  </div>
                  {usernameState === "checking" && (
                    <span className="flex items-center gap-1 text-xs text-baba-slate/50">
                      <Loader2 className="h-3 w-3 animate-spin" /> Checking…
                    </span>
                  )}
                  {usernameState === "available" && (
                    <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                      <Check className="h-3 w-3" /> {username.trim()} is yours — good choice.
                    </span>
                  )}
                  {usernameState === "taken" && (
                    <span className="text-xs font-medium text-destructive">
                      Username has been taken — that name is already claimed by someone else.
                      Try adding a middle name or a number.
                    </span>
                  )}
                  <span className="text-[0.7rem] text-baba-slate/50">
                    Your name works as a username too. If it clashes with someone else's, we will tell you
                    here — just make it your own.
                  </span>
                </label>
                <label className="grid gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">Password</span>
                  <div className="flex items-center gap-2 rounded-lg border border-input bg-card px-3.5 focus-within:border-baba-blue">
                    <Lock className="h-4 w-4 text-baba-slate/40" />
                    <input
                      required
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      minLength={6}
                      className="w-full bg-transparent py-2.5 text-sm text-baba-slate focus:outline-none"
                      placeholder="Make a password (6 or more)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="shrink-0 text-baba-slate/40 transition-colors hover:text-baba-slate/70"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <PasswordStrength password={password} />
                </label>
                <label className="grid gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">Type Password Again</span>
                  <div className="flex items-center gap-2 rounded-lg border border-input bg-card px-3.5 focus-within:border-baba-blue">
                    <Lock className="h-4 w-4 text-baba-slate/40" />
                    <input
                      required
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      className="w-full bg-transparent py-2.5 text-sm text-baba-slate focus:outline-none"
                      placeholder="Type the same password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="shrink-0 text-baba-slate/40 transition-colors hover:text-baba-slate/70"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== password && (
                    <span className="text-[0.7rem] text-red-500">
                      The two passwords are not the same.
                    </span>
                  )}
                </label>
              </div>
            </div>
          )}

          {mode === "join" && intent === "member" && step === 2 && (
            <div className="rounded-2xl border border-baba-blue/10 bg-card p-6">
              <div className="mb-4 text-center">
                <h2 className="font-display text-xl font-bold text-baba-slate">What do you do?</h2>
                <p className="mt-1 text-sm text-baba-slate/60">
                  Pick the one that fits you best — we count every single one of you.
                </p>
              </div>
              <label className="grid gap-1.5">
                <select
                  value={selected[0] ?? ""}
                  onChange={(e) => chooseProfession(e.target.value)}
                  className="w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-baba-slate focus:border-baba-blue focus:outline-none"
                >
                  <option value="">Select — what do you do?</option>
                  {PROFESSIONS.map((p) => (
                    <option key={p.key} value={p.key}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </label>
              {isOther && (
                <input
                  value={otherProfession}
                  onChange={(e) => setOtherProfession(e.target.value)}
                  placeholder="Type the work you do"
                  className="mt-3 w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-baba-slate focus:border-baba-blue focus:outline-none"
                />
              )}
            </div>
          )}

          {mode === "join" && intent === "member" && step === 3 && (
            <div className="rounded-2xl border border-baba-blue/10 bg-card p-6">
              <div className="mb-4 text-center">
                <h2 className="font-display text-xl font-bold text-baba-slate">About you</h2>
                <p className="mt-1 text-sm text-baba-slate/60">
                  {googleSetup
                    ? "Just a few details so we know who we are talking to."
                    : `Continuing as ${memberFullName || "you"} — just a few details and we are done.`}
                </p>
              </div>
              {googleSetup && (
                <label className="mb-4 grid gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">Full name</span>
                  <div className="flex items-center gap-2 rounded-lg border border-input bg-card px-3.5">
                    <User className="h-4 w-4 text-baba-slate/40" />
                    <input
                      required
                      value={fullName}
                      readOnly
                      className="w-full cursor-not-allowed bg-transparent py-2.5 text-sm text-baba-slate opacity-70 focus:outline-none"
                      placeholder="Your name"
                    />
                    <Lock className="h-4 w-4 shrink-0 text-baba-copper" />
                  </div>
                  <span className="text-[0.7rem] text-baba-slate/50">
                    This is the name from your Google account — it stays as it is.
                  </span>
                </label>
              )}
              <div className="grid gap-4">
                <label className="grid gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">
                    Phone Number <span className="font-normal normal-case text-baba-slate/50">(required)</span>
                  </span>
                  <div className="flex items-center gap-2 rounded-lg border border-input bg-card px-3.5 focus-within:border-baba-blue">
                    <Phone className="h-4 w-4 text-baba-slate/40" />
                    <input
                      required
                      type="tel"
                      inputMode="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        setCountryFromPhone(e.target.value);
                      }}
                      className="w-full bg-transparent py-2.5 text-sm text-baba-slate focus:outline-none"
                      placeholder="e.g. +254 712 345 678"
                    />
                  </div>
                </label>
                <label className="grid gap-1.5">
                  <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-baba-slate/70">
                    <MapPin className="h-3.5 w-3.5" /> Where are you?
                  </span>
                  <LocationPicker value={location} onChange={setLocation} />
                  <span className="text-[0.7rem] text-baba-slate/50">
                    Pick your country and town, then type your area (e.g. Westlands, South B).
                  </span>
                </label>
                <label className="grid gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">
                    National Identification No{" "}
                    <span className="font-normal normal-case text-baba-slate/50">(optional)</span>
                  </span>
                  <div className="flex items-center gap-2 rounded-lg border border-input bg-card px-3.5 focus-within:border-baba-blue">
                    <IdCard className="h-4 w-4 text-baba-slate/40" />
                    <input
                      inputMode="numeric"
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      className="w-full bg-transparent py-2.5 text-sm text-baba-slate focus:outline-none"
                      placeholder="Your National Identification No (optional)"
                    />
                  </div>
                  <span className="text-[0.7rem] text-baba-slate/50">
                    Optional — you can add it later in your profile.
                  </span>
                </label>
                <label className="grid gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">
                    Email <span className="font-normal normal-case text-baba-slate/50">(optional)</span>
                  </span>
                  <div className="flex items-center gap-2 rounded-lg border border-input bg-card px-3.5 focus-within:border-baba-blue">
                    <Mail className="h-4 w-4 text-baba-slate/40" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent py-2.5 text-sm text-baba-slate focus:outline-none"
                      placeholder="you@example.com"
                    />
                  </div>
                  <span className="text-[0.7rem] text-baba-slate/50">
                    Add an email if you want a welcome message and help if you forget your password.
                  </span>
                </label>
              </div>
            </div>
          )}

          {mode === "join" && intent === "member" && step === 4 && (
            <div className="rounded-2xl border border-baba-blue/10 bg-card p-6">
              <div className="mb-4 text-center">
                <h2 className="font-display text-xl font-bold text-baba-slate">A little about your work</h2>
                <p className="mt-1 text-sm text-baba-slate/60">Just a few quick choices — that is all.</p>
              </div>
              <div className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-1.5">
                    <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">
                      Level of education
                    </span>
                    <select
                      value={education}
                      onChange={(e) => setEducation(e.target.value)}
                      className="rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-baba-slate focus:border-baba-blue focus:outline-none"
                    >
                      <option value="">Select…</option>
                      {EDUCATION_OPTIONS.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-1.5">
                    <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">
                      How do you work?
                    </span>
                    <select
                      value={employment}
                      onChange={(e) => setEmployment(e.target.value)}
                      className="rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-baba-slate focus:border-baba-blue focus:outline-none"
                    >
                      <option value="">Select…</option>
                      {EMPLOYMENT_OPTIONS.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <label className="grid gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">
                    How long have you been doing this?
                  </span>
                  <select
                    value={years}
                    onChange={(e) => setYears(e.target.value)}
                    className="rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-baba-slate focus:border-baba-blue focus:outline-none"
                  >
                    <option value="">Select…</option>
                    {YEARS_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          )}

          {mode === "join" && intent === "member" && step === 5 && (
            <div className="rounded-2xl border border-baba-blue/10 bg-card p-6">
              <div className="mb-4 text-center">
                <h2 className="font-display text-xl font-bold text-baba-slate">Is everything right?</h2>
                <p className="mt-1 text-sm text-baba-slate/60">Have a quick look — you can go Back to change anything.</p>
              </div>
              <div className="grid gap-3 text-sm">
                <ReviewRow label="Full name" value={memberFullName || fullName.trim()} />
                {username.trim() && <ReviewRow label="Username" value={username.trim()} />}
                <ReviewRow label="Phone" value={phone.trim()} />
                {idNumber.trim() && <ReviewRow label="ID number" value={idNumber.trim()} />}
                <ReviewRow
                  label="What you do"
                  value={
                    isOther && otherProfession.trim()
                      ? otherProfession.trim()
                      : primaryProfession
                        ? professionLabel(primaryProfession)
                        : "—"
                  }
                />
                {education && <ReviewRow label="Education" value={education} />}
                {employment && <ReviewRow label="How you work" value={employment} />}
                {years && <ReviewRow label="Years doing this" value={years} />}
                {email.trim() && <ReviewRow label="Email" value={email.trim()} />}
                {[location.area, location.city, location.country].some(Boolean) && (
                  <ReviewRow
                    label="Location"
                    value={[location.area, location.city, location.country].filter(Boolean).join(", ")}
                  />
                )}
              </div>
              {!googleSetup && (
                <label className="mt-4 grid gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">
                    Type your password again to confirm
                  </span>
                  <div className="flex items-center gap-2 rounded-lg border border-input bg-card px-3.5 focus-within:border-baba-blue">
                    <Lock className="h-4 w-4 text-baba-slate/40" />
                    <input
                      required
                      type={showReviewPassword ? "text" : "password"}
                      value={reviewPassword}
                      onChange={(e) => setReviewPassword(e.target.value)}
                      autoComplete="new-password"
                      className="w-full bg-transparent py-2.5 text-sm text-baba-slate focus:outline-none"
                      placeholder="Type your password again"
                    />
                    <button
                      type="button"
                      onClick={() => setShowReviewPassword((v) => !v)}
                      className="shrink-0 text-baba-slate/40 transition-colors hover:text-baba-slate/70"
                      aria-label={showReviewPassword ? "Hide password" : "Show password"}
                      tabIndex={-1}
                    >
                      {showReviewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <span className="text-[0.7rem] text-baba-slate/50">
                    We never show your password on this page — you type it again, so only you confirm it.
                  </span>
                  {reviewPassword && reviewPassword !== password && (
                    <span className="text-[0.7rem] text-red-500">
                      That is not the password you chose. Type it again.
                    </span>
                  )}
                </label>
              )}
              <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                <Check className="h-4 w-4" /> All good — tap Join us below!
              </div>
            </div>
          )}

          {mode === "join" && intent === "member" && step === 6 && (
            <div className="mx-auto max-w-xl text-center">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-baba-blue/10 text-baba-blue">
                <PartyPopper className="h-8 w-8" />
              </span>
              <h1 className="mt-6 font-display text-3xl font-extrabold text-baba-blue">
                Congratulations, {memberFullName || fullName.trim() || "welcome"}! 🎉
              </h1>
              <p className="mt-3 text-baba-slate/70">
                You are now part of Buy Africa Build Africa. Your registration is saved — head to your
                dashboard to manage your profile, explore opportunities and track your registrations.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  to="/dashboard"
                  className="rounded-full baba-cta px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-baba-blue/25"
                >
                  Go to Dashboard
                </Link>
                <Link
                  to="/events"
                  className="rounded-full border-2 border-baba-copper px-6 py-3 text-sm font-semibold text-baba-copper-dark transition-colors hover:bg-baba-copper hover:text-baba-slate"
                >
                  Explore Events
                </Link>
              </div>
            </div>
          )}

          {mode === "join" && intent === "partner" && (
            <>
              <label className="grid gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">
                  What are you looking for?
                </span>
                <input
                  value={lookingFor}
                  onChange={(e) => setLookingFor(e.target.value)}
                  placeholder="e.g. funding, partnership, training, equipment, mentorship"
                  className="rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-baba-slate focus:border-baba-blue focus:outline-none"
                />
              </label>
              <label className="grid gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">
                  Tell us everything
                </span>
                <textarea
                  rows={10}
                  value={partnerMessage}
                  onChange={(e) => setPartnerMessage(e.target.value)}
                  placeholder="Your vision, your plan, what you want to do with us — write as much as you like. We will read every word."
                  className="w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-baba-slate focus:border-baba-blue focus:outline-none"
                />
                <span className="text-[0.7rem] text-baba-slate/50">
                  Not compulsory — but the more you tell us, the better we can serve you.
                </span>
              </label>
              <label className="grid gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">
                  {mode === "join" && intent === "partner" ? "Your Name / Organisation Name" : "Full name"}
                </span>
                <div className="flex items-center gap-2 rounded-lg border border-input bg-card px-3.5 focus-within:border-baba-blue">
                  <User className="h-4 w-4 text-baba-slate/40" />
                  <input
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    readOnly={!!googleSetup}
                    className={`w-full bg-transparent py-2.5 text-sm text-baba-slate focus:outline-none ${googleSetup ? "cursor-not-allowed opacity-70" : ""}`}
                    placeholder={
                      mode === "join" && intent === "partner"
                        ? "Your name or organisation name"
                        : "e.g. Jane Wanjiru"
                    }
                  />
                  {googleSetup && <Lock className="h-4 w-4 shrink-0 text-baba-copper" />}
                </div>
              </label>
              <label className="grid gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">
                  Phone Number <span className="font-normal normal-case text-baba-slate/50">(required)</span>
                </span>
                <div className="flex items-center gap-2 rounded-lg border border-input bg-card px-3.5 focus-within:border-baba-blue">
                  <Phone className="h-4 w-4 text-baba-slate/40" />
                  <input
                    required
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setCountryFromPhone(e.target.value);
                    }}
                    className="w-full bg-transparent py-2.5 text-sm text-baba-slate focus:outline-none"
                    placeholder="e.g. +254 712 345 678"
                  />
                </div>
              </label>
              <label className="grid gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">Password</span>
                <div className="flex items-center gap-2 rounded-lg border border-input bg-card px-3.5 focus-within:border-baba-blue">
                  <Lock className="h-4 w-4 text-baba-slate/40" />
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    minLength={6}
                    className="w-full bg-transparent py-2.5 text-sm text-baba-slate focus:outline-none"
                    placeholder="Make a password (6 or more)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="shrink-0 text-baba-slate/40 transition-colors hover:text-baba-slate/70"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <PasswordStrength password={password} />
              </label>
              <label className="grid gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">
                  Type Password Again
                </span>
                <div className="flex items-center gap-2 rounded-lg border border-input bg-card px-3.5 focus-within:border-baba-blue">
                  <Lock className="h-4 w-4 text-baba-slate/40" />
                  <input
                    required
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    className="w-full bg-transparent py-2.5 text-sm text-baba-slate focus:outline-none"
                    placeholder="Type the same password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="shrink-0 text-baba-slate/40 transition-colors hover:text-baba-slate/70"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPassword && confirmPassword !== password && (
                  <span className="text-[0.7rem] text-red-500">
                    The two passwords are not the same.
                  </span>
                )}
              </label>
              <label className="grid gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">
                  Email <span className="font-normal normal-case text-baba-slate/50">(required)</span>
                </span>
                <div className="flex items-center gap-2 rounded-lg border border-input bg-card px-3.5 focus-within:border-baba-blue">
                  <Mail className="h-4 w-4 text-baba-slate/40" />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent py-2.5 text-sm text-baba-slate focus:outline-none"
                    placeholder="you@example.com"
                  />
                </div>
                <span className="text-[0.7rem] text-baba-slate/50">
                  We use this to reach you — that is all.
                </span>
              </label>
            </>
          )}

          {mode === "signin" && (
            <label className="grid gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">
                Username, email, name or ID number
              </span>
              <div className="flex items-center gap-2 rounded-lg border border-input bg-card px-3.5 focus-within:border-baba-blue">
                <User className="h-4 w-4 text-baba-slate/40" />
                <input
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  className="w-full bg-transparent py-2.5 text-sm text-baba-slate focus:outline-none"
                  placeholder="e.g. janewanjiru@gmail.com"
                />
              </div>
              <span className="text-[0.7rem] text-baba-slate/50">
                Any one works: your username, your email, your full name, or your National ID number.
                Your name is also a username — if you chose it as yours.
              </span>
            </label>
          )}

          {mode === "signin" && askForId && (
            <label className="grid gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">
                National Identification No{" "}
                <span className="font-normal normal-case text-baba-slate/50">(only to tell you apart)</span>
              </span>
              <div className="flex items-center gap-2 rounded-lg border border-input bg-card px-3.5 focus-within:border-baba-blue">
                <IdCard className="h-4 w-4 text-baba-slate/40" />
                <input
                  inputMode="numeric"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  className="w-full bg-transparent py-2.5 text-sm text-baba-slate focus:outline-none"
                  placeholder="Your National Identification No"
                />
              </div>
            </label>
          )}

          {mode === "signin" && (
            <label className="grid gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">
                Password
              </span>
              <div className="flex items-center gap-2 rounded-lg border border-input bg-card px-3.5 focus-within:border-baba-blue">
                <Lock className="h-4 w-4 text-baba-slate/40" />
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  minLength={6}
                  className="w-full bg-transparent py-2.5 text-sm text-baba-slate focus:outline-none"
                  placeholder="Your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="shrink-0 text-baba-slate/40 transition-colors hover:text-baba-slate/70"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>
          )}

          {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          {notice && (
            <p className="rounded-lg border border-baba-blue/20 bg-baba-blue/5 px-3.5 py-2.5 text-sm font-medium text-baba-blue">
              {notice}
            </p>
          )}

          {mode === "join" && intent === "member" && step < 6 ? (
            <div className="mt-2 flex items-center justify-between gap-3">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="inline-flex items-center gap-1 rounded-lg border border-baba-blue/15 px-4 py-2.5 text-sm font-semibold text-baba-slate/70 transition-colors hover:border-baba-blue/40"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
              ) : (
                <span />
              )}
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-lg baba-cta px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-baba-blue-dark disabled:opacity-60"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {step === 5 ? "Join us" : "Next"}
                {step < 5 && <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
          ) : mode === "join" && intent === "member" && step === 6 ? null : (
            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex items-center justify-center gap-2 rounded-lg baba-cta py-2.5 text-sm font-semibold text-white transition-colors hover:bg-baba-blue-dark disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}

              {mode === "join" ? "Partner with us" : "Log In"}
            </button>
          )}
        </form>

        {mode === "signin" && (
          <p className="mt-4 text-center text-sm">
            <Link to="/forgot-password" className="font-semibold text-baba-blue hover:underline">
              Forgot your password?
            </Link>
          </p>
        )}

        <p className="mt-6 text-center text-sm text-baba-slate/70">
          {mode === "join" ? "Already a member?" : "New here?"}{" "}
          <button
            onClick={() => {
              setMode(mode === "join" ? "signin" : "join");
              setError("");
              setNotice("");
              setAskForId(false);
              setGoogleSetup(null);
            }}
            className="font-bold text-baba-copper-dark hover:underline"
          >
            {mode === "join" ? "Log in" : "Join us"}
          </button>
        </p>

        {mode === "join" && (
          <>
            <div className="mt-6 flex items-center gap-3 text-xs text-baba-slate/50">
              <span className="h-px flex-1 bg-baba-blue/10" />
              or
              <span className="h-px flex-1 bg-baba-blue/10" />
            </div>

            <button
              type="button"
              onClick={signInWithGoogle}
              disabled={loading}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-baba-blue/20 bg-card px-4 py-2.5 text-sm font-semibold text-baba-slate transition-colors hover:bg-baba-blue/5 disabled:opacity-60"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
              </svg>
              {mode === "join" ? "Join with Google" : "Log in with Google"}
            </button>
          </>
        )}
        <p className="mt-4 text-center text-xs text-baba-slate/50">
          <Link to="/" className="hover:underline">
            Back to home
          </Link>
        </p>
      </section>
    </PageShell>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-baba-blue/10 pb-2">
      <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/60">{label}</span>
      <span className="text-right font-semibold text-baba-slate">{value}</span>
    </div>
  );
}
