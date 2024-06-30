// modul java scriptowy, ktory jest funkcja zwracajaca obiekt
// ten obiekt ma dwie reguly
// te reguly walidacji w wvue dziala tak, ze albo zwracaja true i wtedy walidacja jest spelniona
// albo napis i wtedy jest blad
export const useFormValidationRules = () => {
	return {
		// pierwsza regula wymagalnosci !! to jest taki hax, bo pojedynćzy ! rzutuje(konwertuje) ta zmienna na boola
		// podwojne zaprzeczenie sprawdzamy, czy ta zmienna jest wypelniona, jesli tak to regula jest ok
		// jesli nie to wyswietlamy napis wymagane
		// !!v to sposób na przekształcenie v na wartość logiczną (true lub false). 
		// Dwa wykrzykniki to podwójne zaprzeczenie, które zmienia dowolną wartość na odpowiednią wartość logiczną.
		// przyklad
		//!!"hello":
		//Pierwszy wykrzyknik: !"hello" → false.
		//Drugi wykrzyknik: !false → true.

		// v jest fałszywe, np. pusty string, null, undefined, 0 itp.),

		// Operator || w języku JavaScript jest operatorem logicznym "lub" (OR). 
		// Działa on w sposób, który zwraca pierwszą wartość prawdziwą (truthy) spośród swoich operandów lub
		// ostatnią wartość, jeśli wszystkie są fałszywe (falsy).
		ruleRequired: (v) => !!v || "Wymagane",
		// regula walidacji maila
		// jest skomplikowane znalezione w internecie, bardzo dobrze waliduje maile
		ruleEmail: (value) => {
			const pattern =
				/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			// test funkcja testuja reg
			// jesli wartosc pasuje do tego wyrazenia, czyli przechodzi to jest ok
			return pattern.test(value) || "Niepoprawny adres email";
		}
	};
};