"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useAppStore } from "@/store";

const JEWISH_NAMES = [
  // Classic surnames
  { name: "Cohen", count: 12847 },
  { name: "Levy", count: 8932 },
  { name: "Goldberg", count: 6421 },
  { name: "Friedman", count: 5893 },
  { name: "Schwartz", count: 5672 },
  { name: "Shapiro", count: 4891 },
  { name: "Katz", count: 4567 },
  { name: "Rosen", count: 4234 },
  { name: "Bernstein", count: 3987 },
  { name: "Weiss", count: 3765 },
  { name: "Klein", count: 3654 },
  { name: "Epstein", count: 3421 },
  { name: "Goldstein", count: 3198 },
  { name: "Kaplan", count: 2987 },
  { name: "Silverman", count: 2876 },
  { name: "Stern", count: 2754 },
  { name: "Greenberg", count: 2643 },
  { name: "Rubin", count: 2532 },
  { name: "Adler", count: 2421 },
  { name: "Blum", count: 2198 },
  // More classic surnames
  { name: "Rosenberg", count: 2156 },
  { name: "Horowitz", count: 2098 },
  { name: "Feldman", count: 2043 },
  { name: "Weinstein", count: 1987 },
  { name: "Berkowitz", count: 1932 },
  { name: "Abramowitz", count: 1876 },
  { name: "Lieberman", count: 1821 },
  { name: "Moskowitz", count: 1765 },
  { name: "Finkelstein", count: 1712 },
  { name: "Rothstein", count: 1654 },
  { name: "Stein", count: 1598 },
  { name: "Zimmerman", count: 1543 },
  { name: "Hoffman", count: 1487 },
  { name: "Kessler", count: 1432 },
  { name: "Schreiber", count: 1376 },
  { name: "Weissman", count: 1321 },
  { name: "Eisenberg", count: 1265 },
  { name: "Rosenbaum", count: 1212 },
  { name: "Perlman", count: 1156 },
  { name: "Blumenthal", count: 1098 },
  // Hebrew first names
  { name: "Avi", count: 1067 },
  { name: "Moshe", count: 1043 },
  { name: "Rivka", count: 1021 },
  { name: "Yosef", count: 998 },
  { name: "Miriam", count: 976 },
  { name: "Shlomo", count: 954 },
  { name: "Devorah", count: 932 },
  { name: "Chaim", count: 912 },
  { name: "Esther", count: 891 },
  { name: "Menachem", count: 876 },
  { name: "Leah", count: 854 },
  { name: "Yakov", count: 832 },
  { name: "Chana", count: 812 },
  { name: "Dovid", count: 798 },
  { name: "Malka", count: 776 },
  { name: "Shmuel", count: 754 },
  { name: "Bracha", count: 732 },
  { name: "Eli", count: 712 },
  { name: "Shira", count: 698 },
  { name: "Noam", count: 676 },
  // Yiddish names
  { name: "Mendel", count: 654 },
  { name: "Golda", count: 643 },
  { name: "Yankel", count: 632 },
  { name: "Faigy", count: 621 },
  { name: "Srulik", count: 612 },
  { name: "Shayna", count: 598 },
  { name: "Beryl", count: 587 },
  { name: "Gittel", count: 576 },
  { name: "Hershel", count: 565 },
  { name: "Rivky", count: 554 },
  { name: "Moishy", count: 543 },
  { name: "Tzippy", count: 532 },
  { name: "Leibel", count: 521 },
  { name: "Chaya", count: 512 },
  { name: "Zalman", count: 498 },
  // Modern Israeli names
  { name: "Noa", count: 487 },
  { name: "Eitan", count: 476 },
  { name: "Tamar", count: 465 },
  { name: "Oren", count: 454 },
  { name: "Yael", count: 443 },
  { name: "Gilad", count: 432 },
  { name: "Liora", count: 421 },
  { name: "Dov", count: 412 },
  { name: "Talia", count: 398 },
  { name: "Ariel", count: 387 },
  { name: "Nava", count: 376 },
  { name: "Ilan", count: 365 },
  { name: "Aviva", count: 354 },
  { name: "Gideon", count: 343 },
  { name: "Dalia", count: 332 },
  // More surnames
  { name: "Levine", count: 321 },
  { name: "Greenbaum", count: 312 },
  { name: "Wexler", count: 298 },
  { name: "Rosenfeld", count: 287 },
  { name: "Grossman", count: 276 },
  { name: "Diamond", count: 265 },
  { name: "Segal", count: 254 },
  { name: "Rubenstein", count: 243 },
  { name: "Margolis", count: 232 },
  { name: "Lefkowitz", count: 221 },
  { name: "Gutman", count: 212 },
  { name: "Strauss", count: 198 },
  { name: "Baum", count: 187 },
  { name: "Feinberg", count: 176 },
  { name: "Mandelbaum", count: 165 },
  { name: "Teitelbaum", count: 156 },
  { name: "Birnbaum", count: 145 },
  { name: "Weinberg", count: 134 },
  { name: "Jacobson", count: 123 },
  { name: "Isaacs", count: 112 },
  // Common Americanized Jewish first names
  { name: "Seth", count: 109 },
  { name: "Rachel", count: 105 },
  { name: "Aaron", count: 101 },
  { name: "Rebecca", count: 98 },
  { name: "Ethan", count: 95 },
  { name: "Hannah", count: 92 },
  { name: "Noah", count: 89 },
  { name: "Abigail", count: 86 },
  { name: "Samuel", count: 83 },
  { name: "Naomi", count: 80 },
  { name: "Benjamin", count: 77 },
  { name: "Sarah", count: 74 },
  { name: "Daniel", count: 71 },
  { name: "Leah", count: 68 },
  { name: "Adam", count: 65 },
  { name: "Ruth", count: 62 },
  { name: "Max", count: 59 },
  { name: "Sophia", count: 56 },
  { name: "Jake", count: 53 },
  { name: "Ilana", count: 50 },
  // Sephardic names
  { name: "Ezra", count: 48 },
  { name: "Shoshana", count: 46 },
  { name: "Rafi", count: 44 },
  { name: "Mazal", count: 42 },
  { name: "Nissim", count: 40 },
  { name: "Allegra", count: 38 },
  { name: "Baruch", count: 36 },
  { name: "Simcha", count: 34 },
  { name: "Ovadia", count: 32 },
  { name: "Penina", count: 30 },
];

const GOY_NAMES = [
  // Everyday American
  { name: "Mike", count: 24567 },
  { name: "Chris", count: 23891 },
  { name: "Sarah", count: 22456 },
  { name: "Amanda", count: 21234 },
  { name: "Matt", count: 20891 },
  { name: "Jessica", count: 20123 },
  { name: "Josh", count: 19567 },
  { name: "Ashley", count: 19234 },
  { name: "Ryan", count: 18901 },
  { name: "Braden", count: 18432 },
  { name: "Nick", count: 18012 },
  { name: "Stephanie", count: 17654 },
  { name: "Kevin", count: 17321 },
  { name: "Kayden", count: 16891 },
  { name: "Jennifer", count: 16543 },
  { name: "Brian", count: 16234 },
  { name: "Michelle", count: 15890 },
  { name: "Jake", count: 15678 },
  { name: "Megan", count: 15432 },
  { name: "Hunter", count: 15234 },
  { name: "Connor", count: 14987 },
  { name: "Brittany", count: 14765 },
  { name: "Tanner", count: 14567 },
  { name: "Lauren", count: 14321 },
  { name: "Colton", count: 13890 },
  { name: "Heather", count: 13654 },
  { name: "Andrew", count: 13432 },
  { name: "Rachel", count: 13210 },
  { name: "Justin", count: 12987 },
  { name: "Amber", count: 12765 },
  { name: "Brayden", count: 12456 },
  { name: "Kayla", count: 12198 },
  { name: "Dakota", count: 11892 },
  { name: "Samantha", count: 11654 },
  { name: "Wyatt", count: 11234 },
  { name: "Tiffany", count: 11012 },
  { name: "Cody", count: 10567 },
  { name: "Courtney", count: 10321 },
  // Hispanic/Latino
  { name: "Jose", count: 10198 },
  { name: "Maria", count: 10087 },
  { name: "Carlos", count: 9987 },
  { name: "Travis", count: 9890 },
  { name: "Sofia", count: 9765 },
  { name: "Diego", count: 9543 },
  { name: "Tyler", count: 9234 },
  { name: "Guadalupe", count: 9012 },
  { name: "Miguel", count: 8876 },
  { name: "Kyle", count: 8567 },
  { name: "Rosa", count: 8432 },
  { name: "Juan", count: 8321 },
  { name: "Alejandro", count: 8198 },
  { name: "Camila", count: 8087 },
  { name: "Brandon", count: 7890 },
  { name: "Luis", count: 7765 },
  { name: "Isabella", count: 7654 },
  { name: "Angel", count: 7543 },
  { name: "Dustin", count: 7234 },
  { name: "Valentina", count: 7098 },
  { name: "Jorge", count: 6987 },
  { name: "Carmen", count: 6876 },
  { name: "Ricardo", count: 6765 },
  // Black American
  { name: "Deshawn", count: 6654 },
  { name: "Chad", count: 6567 },
  { name: "Keisha", count: 6432 },
  { name: "Malik", count: 6321 },
  { name: "Jaylen", count: 6198 },
  { name: "Aaliyah", count: 6087 },
  { name: "Darius", count: 5987 },
  { name: "Brett", count: 5890 },
  { name: "Imani", count: 5765 },
  { name: "Tyrone", count: 5654 },
  { name: "Lamar", count: 5543 },
  { name: "Shaniqua", count: 5432 },
  { name: "Jamal", count: 5321 },
  { name: "Colt", count: 5234 },
  { name: "Ebony", count: 5123 },
  { name: "DeAndre", count: 5012 },
  { name: "Destiny", count: 4901 },
  { name: "Marcus", count: 4812 },
  { name: "Latasha", count: 4723 },
  { name: "Terrell", count: 4634 },
  // Southern/Country
  { name: "Tucker", count: 4567 },
  { name: "Tamika", count: 4456 },
  { name: "Savannah", count: 4345 },
  { name: "Billy", count: 4234 },
  { name: "Bobby", count: 4123 },
  { name: "Gunner", count: 3890 },
  { name: "Dolly", count: 3765 },
  { name: "Waylon", count: 3654 },
  { name: "Daisy", count: 3543 },
  { name: "Hank", count: 3432 },
  { name: "Blaine", count: 3234 },
  { name: "Loretta", count: 3123 },
  { name: "Cletus", count: 3012 },
  { name: "Jolene", count: 2901 },
  { name: "Earl", count: 2812 },
  { name: "Charlene", count: 2723 },
  // More everyday
  { name: "Stetson", count: 2567 },
  { name: "Dan", count: 2456 },
  { name: "Oakley", count: 2234 },
  { name: "Lisa", count: 2198 },
  { name: "Tom", count: 2123 },
  { name: "Karen", count: 2056 },
  { name: "Steve", count: 1987 },
  { name: "Ryder", count: 1890 },
  { name: "Dave", count: 1823 },
  { name: "Amy", count: 1756 },
  { name: "Jeff", count: 1689 },
  { name: "Maverick", count: 1567 },
  { name: "Rob", count: 1498 },
  { name: "Becky", count: 1432 },
  { name: "Jim", count: 1365 },
  { name: "Austin", count: 1234 },
  { name: "Tammy", count: 1167 },
  { name: "Randy", count: 1098 },
  { name: "Presley", count: 987 },
  { name: "Dixie", count: 876 },
  { name: "Shelby", count: 765 },
  { name: "Crystal", count: 654 },
  // Asian American
  { name: "David", count: 612 },
  { name: "Emily", count: 587 },
  { name: "Daniel", count: 565 },
  { name: "Grace", count: 543 },
  { name: "Jason", count: 521 },
  { name: "Cindy", count: 498 },
  { name: "Eric", count: 476 },
  { name: "Angela", count: 454 },
  { name: "Steven", count: 432 },
  { name: "Christina", count: 410 },
  { name: "Patrick", count: 389 },
  { name: "Tina", count: 367 },
  { name: "Tony", count: 345 },
  { name: "Linda", count: 323 },
  { name: "Alex", count: 301 },
  { name: "Priya", count: 287 },
  { name: "Wei", count: 265 },
  { name: "Mei", count: 243 },
  { name: "Raj", count: 221 },
  { name: "Anh", count: 198 },
];

export default function NamesDropdown() {
  const [open, setOpen] = useState(false);
  const mode = useAppStore((s) => s.mode);
  const names = mode === "jewish" ? JEWISH_NAMES : GOY_NAMES;
  const header = mode === "jewish" ? "Jewish Names" : "Popular Names";
  const accentColor = mode === "jewish" ? "purple" : "green";

  const [allChecked, setAllChecked] = useState(true);
  const [checked, setChecked] = useState<Record<string, boolean>>(
    Object.fromEntries(names.map((n) => [n.name, true]))
  );
  const ref = useRef<HTMLDivElement>(null);

  // Reset checked state when mode changes
  useEffect(() => {
    setAllChecked(true);
    setChecked(Object.fromEntries(names.map((n) => [n.name, true])));
  }, [mode]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const toggleAll = () => {
    const next = !allChecked;
    setAllChecked(next);
    setChecked(Object.fromEntries(names.map((n) => [n.name, next])));
  };

  const toggleName = (name: string) => {
    const next = { ...checked, [name]: !checked[name] };
    setChecked(next);
    setAllChecked(Object.values(next).every(Boolean));
  };

  const totalCount = names.reduce((s, n) => s + n.count, 0);

  const checkboxClasses = (isChecked: boolean) =>
    `w-4 h-4 rounded flex items-center justify-center border transition-colors ${
      isChecked
        ? accentColor === "purple"
          ? "bg-purple-500 border-purple-500"
          : "bg-green-500 border-green-500"
        : "border-border-light"
    }`;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3.5 h-10 rounded-full text-sm font-medium border border-border text-text-secondary bg-bg-card/80 hover:brightness-110 hover:border-border-light transition-all"
      >
        <span className={`w-2 h-2 rounded-full ${accentColor === "purple" ? "bg-purple-400" : "bg-green-400"}`} />
        Names
        <svg
          className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-bg-card/95 backdrop-blur-md border border-border rounded-xl shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="px-4 pt-3 pb-2 border-b border-border/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                {header}
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                accentColor === "purple"
                  ? "text-purple-400/70 bg-purple-400/10"
                  : "text-green-400/70 bg-green-400/10"
              }`}>
                {names.length} names
              </span>
            </div>
          </div>

          {/* All toggle */}
          <button
            onClick={toggleAll}
            className="w-full flex items-center justify-between px-4 py-2.5 border-b border-border/30 hover:bg-bg-card-hover transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <span className={checkboxClasses(allChecked)}>
                {allChecked && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              <span className="text-sm text-text-primary font-medium">All</span>
            </div>
            <span className="text-xs text-text-muted">
              {totalCount.toLocaleString()}
            </span>
          </button>

          {/* Scrollable name list */}
          <div className="max-h-[340px] overflow-y-auto">
            {names.map((n) => (
              <button
                key={n.name}
                onClick={() => toggleName(n.name)}
                className="w-full flex items-center justify-between px-4 py-2 hover:bg-bg-card-hover transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className={checkboxClasses(checked[n.name] ?? true)}>
                    {(checked[n.name] ?? true) && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  <span className="text-sm text-text-primary">{n.name}</span>
                </div>
                <span className="text-xs text-text-muted">
                  {n.count.toLocaleString()}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
