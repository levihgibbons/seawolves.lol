// Faculty + staff roster for Pacifica Christian High School. This is the
// single source of truth for who is ratable on the site — the roster
// changes yearly, so an admin can add/edit/remove people from
// /admin/teachers without a redeploy. This file only seeds the *initial*
// set.
//
// Covers all four sections of the school's public staff directory
// (pacificachristian.org/about/our-staff): Our Faculty, Executive Team,
// Administration, and Counseling & Support Staff — not just classroom
// teachers. `department` holds the site's subject label for faculty, or
// their job title for executive/admin/support staff (there's no "subject"
// analogue for e.g. a Director of Admissions).
//
// photoUrl points at /public/teachers/<slug> — headshots pulled from that
// same directory, matched by name and downloaded locally so the app
// doesn't depend on their server at runtime. Re-run against the live
// directory if someone's photo changes.

export type SeedTeacher = {
  name: string;
  department: string;
  // Classroom faculty vs. administrative/support staff — defaults to true
  // (most entries) when omitted. See Teacher.isFaculty in schema.prisma.
  isFaculty?: boolean;
  photoUrl: string;
};

export const TEACHERS: SeedTeacher[] = [
  // Executive Team
  {
    name: "Jim Knight",
    department: "Head of School",
    isFaculty: false,
    photoUrl: "/teachers/jim-knight.jpg",
  },
  {
    name: "Wally Hirsch",
    department: "Associate Head of School for Student Affairs",
    isFaculty: false,
    photoUrl: "/teachers/wally-hirsch.jpg",
  },
  {
    name: "Brandon Shaw",
    department: "Associate Head of School for Athletics and Student Life",
    isFaculty: false,
    photoUrl: "/teachers/brandon-shaw.jpg",
  },
  {
    name: "Carly Barforth",
    department: "Director of Academic Counseling",
    isFaculty: false,
    photoUrl: "/teachers/carly-barforth.jpg",
  },
  {
    name: "Kelly Gendall",
    department: "Director of Business Operations",
    isFaculty: false,
    photoUrl: "/teachers/kelly-gendall.jpg",
  },
  {
    name: "Nichole KnottCraig",
    department: "Director of Admissions",
    isFaculty: false,
    photoUrl: "/teachers/nichole-knottcraig.jpg",
  },
  {
    name: "Hilary Miller",
    department: "Director of Faculty and Academics",
    isFaculty: false,
    photoUrl: "/teachers/hilary-miller.jpg",
  },
  {
    name: "Dr. Mary Ortiz",
    department: "Director of Academic Strategy and Operations",
    isFaculty: false,
    photoUrl: "/teachers/mary-ortiz.webp",
  },

  // Administration
  {
    name: "Shelby Benjamin",
    department: "Director of Security",
    isFaculty: false,
    photoUrl: "/teachers/shelby-benjamin.jpg",
  },
  {
    name: "Danny Caldera",
    department: "Director of Facilities",
    isFaculty: false,
    photoUrl: "/teachers/danny-caldera.webp",
  },
  {
    name: "Dane Fragger",
    department: "Director of College Counseling",
    isFaculty: false,
    photoUrl: "/teachers/dane-fragger.webp",
  },
  {
    name: "Albert Kong",
    department: "Director of Student Life",
    isFaculty: false,
    photoUrl: "/teachers/albert-kong.jpg",
  },
  {
    name: "Staci Lane",
    department: "Associate Director of Athletics",
    isFaculty: false,
    photoUrl: "/teachers/staci-lane.jpg",
  },
  {
    name: "Bethany Mudd",
    department: "Director of Finance",
    isFaculty: false,
    photoUrl: "/teachers/bethany-mudd.webp",
  },
  {
    name: "Mathew Mulligan",
    department: "Director of Technology",
    isFaculty: false,
    photoUrl: "/teachers/mathew-mulligan.jpg",
  },
  {
    name: "Nate Overby",
    department: "Director of PACARTS",
    isFaculty: false,
    photoUrl: "/teachers/nate-overby.jpg",
  },
  {
    // Official title is "Director of the Minchin Center" (Administration on
    // the school's site), kept as a teaching-flavored label by request since
    // he teaches within that academic economics/innovation program.
    name: "John Reimers",
    department: "Economics / Innovation (The Minchin Center)",
    photoUrl: "/teachers/john-reimers.jpg",
  },
  {
    name: "Stephen Roberson",
    department: "Director, Center for Philosophy & Theology",
    isFaculty: false,
    photoUrl: "/teachers/stephen-roberson.jpg",
  },

  // Counseling & Support Staff
  {
    name: "Essy Anavim",
    department: "Facility Coordinator",
    isFaculty: false,
    photoUrl: "/teachers/essy-anavim.webp",
  },
  {
    name: "Julio Cesar Hernandez",
    department: "Facility Coordinator",
    isFaculty: false,
    photoUrl: "/teachers/julio-cesar-hernandez.webp",
  },
  {
    name: "Trevor DeBenning",
    department: "Chapel Director",
    isFaculty: false,
    photoUrl: "/teachers/trevor-debenning.jpg",
  },
  {
    name: "Melanie Hughes",
    department: "Assistant Director of Marketing - Content & Engagement",
    isFaculty: false,
    photoUrl: "/teachers/melanie-hughes.webp",
  },
  {
    name: "Kelly Kurtenbach",
    department: "Academic & College Counselor",
    isFaculty: false,
    photoUrl: "/teachers/kelly-kurtenbach.jpg",
  },
  {
    name: "Rachel Moore",
    department: "Registrar & Academic Resource Librarian",
    isFaculty: false,
    photoUrl: "/teachers/rachel-moore.jpg",
  },
  {
    name: "Emily Risley",
    department:
      "Assistant Director of Marketing - Digital Strategy & Analytics",
    isFaculty: false,
    photoUrl: "/teachers/emily-risley.jpg",
  },
  {
    name: "Jack Weill",
    department: "Admissions Associate",
    isFaculty: false,
    photoUrl: "/teachers/jack-weill.webp",
  },
  {
    name: "Christian Winter",
    department: "Academic Counselor",
    isFaculty: false,
    photoUrl: "/teachers/christian-winter.webp",
  },
  {
    name: "Bethany Wiseblood",
    department: "Assistant Director of Admissions",
    isFaculty: false,
    photoUrl: "/teachers/bethany-wiseblood.jpg",
  },
  {
    name: "Mercedes Worman",
    department: "Administrative Services Coordinator",
    isFaculty: false,
    photoUrl: "/teachers/mercedes-worman.jpg",
  },
  {
    name: "Brendan Ward",
    department: "Athletics",
    photoUrl: "/teachers/brendan-ward.jpg",
  },

  // Our Faculty
  {
    name: "Tehillah Alphonso",
    department: "A Cappella Music",
    photoUrl: "/teachers/tehillah-alphonso.jpg",
  },
  {
    name: "Sam Anderson",
    department: "Film / Photography",
    photoUrl: "/teachers/sam-anderson.jpg",
  },
  {
    name: "Ruth Andrew",
    department: "English",
    photoUrl: "/teachers/ruth-andrew.webp",
  },
  {
    name: "Matt Benedetto",
    department: "Mathematics",
    photoUrl: "/teachers/matt-benedetto.jpg",
  },
  {
    name: "Scott Comer",
    department: "History / Theology",
    photoUrl: "/teachers/scott-comer.jpg",
  },
  {
    name: "Violet Comer",
    department: "Dance / History",
    photoUrl: "/teachers/violet-comer.webp",
  },
  {
    name: "Amber DeBenning",
    department: "English",
    photoUrl: "/teachers/amber-debenning.jpg",
  },
  {
    name: "Steven Eno",
    department: "Mathematics",
    photoUrl: "/teachers/steven-eno.jpg",
  },
  {
    name: "Nicole Geiger",
    department: "Biology",
    photoUrl: "/teachers/nicole-geiger.jpg",
  },
  {
    name: "Karla Herrera",
    department: "Spanish",
    photoUrl: "/teachers/karla-herrera.webp",
  },
  {
    name: "Clarita Joung",
    department: "Chemistry",
    photoUrl: "/teachers/clarita-joung.jpg",
  },
  {
    name: "Devin Ketch",
    department: "Philosophy / Theology / Psychology",
    photoUrl: "/teachers/devin-ketch.webp",
  },
  {
    name: "Joo Bin Kim",
    department: "History",
    photoUrl: "/teachers/joo-bin-kim.webp",
  },
  {
    name: "Chris McCulloch",
    department: "History / Theology",
    photoUrl: "/teachers/chris-mcculloch.jpg",
  },
  {
    name: "Darryle Mensah",
    department: "Mathematics",
    photoUrl: "/teachers/darryle-mensah.webp",
  },
  {
    name: "Dr. Katheryn Park",
    department: "English",
    photoUrl: "/teachers/katheryn-park.jpg",
  },
  {
    name: "Katie Savage",
    department: "English",
    photoUrl: "/teachers/katie-savage.jpg",
  },
  {
    name: "Linnea Scobey",
    department: "Latin / Theology",
    photoUrl: "/teachers/linnea-scobey.jpg",
  },
  {
    name: "Nic Scobey",
    department: "Biology / Chemistry",
    photoUrl: "/teachers/nic-scobey.jpg",
  },
  {
    name: "Dr. David Sumida",
    department: "Engineering",
    photoUrl: "/teachers/david-sumida.jpg",
  },
  {
    name: "Ryan Tahbaz",
    department: "Spanish / Soccer",
    photoUrl: "/teachers/ryan-tahbaz.jpg",
  },
  {
    name: "Jeremy Tuggy",
    department: "Mathematics",
    photoUrl: "/teachers/jeremy-tuggy.jpg",
  },
  {
    name: "Isaias Uggetti",
    department: "English",
    photoUrl: "/teachers/isaias-uggetti.webp",
  },
  {
    name: "Carson Vandermade",
    department: "Visual Arts",
    photoUrl: "/teachers/carson-vandermade.jpg",
  },
  {
    name: "Zemeira Walker",
    department: "Visual Arts",
    photoUrl: "/teachers/zemeira-walker.webp",
  },
  {
    name: "Michael Weaver",
    department: "History / Theology",
    photoUrl: "/teachers/michael-weaver.jpg",
  },
  {
    name: "Josephine Wilson",
    department: "Mathematics",
    photoUrl: "/teachers/josephine-wilson.jpg",
  },
];
