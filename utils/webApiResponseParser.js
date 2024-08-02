export const useWebApiResponseParser = () => {
    return {
        getErrorMessage: (response, messageMap, fieldMap) => {
			// robimy to po z API bardziej zwracamy klucze, a nie komunikaty tekstowe
			// dlatego, ze konkretne wiadomsci chcemy miec na frontcie, zeby np. miec obsluge wielu jezykow
			// bo z api po angielsku, a my chcemy po polsku.
			// dlatego z api zwracamy komunikaty bledow jako klucze, a na froncie wyswietlamy wlasciwe komunikaty

			// messageMap -> obiekt z JavaScriptu, ktory mapuje komunikat bledu na wiadomosc, ktora musi wyswietlic
            // dzieki temu roznicujemy komunikaty, w jednym komponencie przy jednym requescie moga byc inne komunikaty
			// a przy innym inne


			// fieldMap -> analogiczna sytuacja, czyli bedziemy tego uzywac do walidacji fluentwalidatora
			// ktory rzuca tez bledy, mozemy podac mapowania na nazwy pol
			// czyli np. w API bedzie to pole password, a my chcemy zeby w interfejsie wyswietlalo sie haslo

			if (response) {
				// generalnie ta funkcja zwraca napis z komunikatami bledow
				// 401 -> wzielo sie z ExceptionResultMiddleware -> catch UnauthorizedException
				// gdy nie mamy dostepu do jakies funkcji aplikacji
                if (response.status === 401) {
                    return "Brak dostępu";
                }
				// validationException
                else if (response.status === 422) {
					// ten response to json, ktory bedzie lista i bedzie mial FieldName i Error
					// klasa ValidationErrorResponse
                    if (response._data && response._data.errors) {
                        let messages = [];
						// tworzymy mappery poprzez sklejenie ze soba dwoch obiektow,
						// tych domyslnych oraz tych ktore przyjda jako parametr
						// czyli taka jedna duza mape mamy, ktora zawiera te oba mapowania
                        const messageMapEx = {...defaultValidationMessages, ...messageMap };
                        const fieldMapEx = { ...defaultFieldNames, ...fieldMap };

                        response._data.errors.forEach(e => {
							// fieldName, czyli to co przychodzi z Api jako FieldName 
							// jesli nie ma mapowania to bierzemy to co przychodzi z API, czyli -> e.fieldName
                            messages.push(`Błąd w polu ${fieldMapEx[e.fieldName] ?? e.fieldName}: ${messageMapEx[e.error] ?? e.error}`);
                        });
						// laczymy te wiadomosci znakiem nowej linii
                        return messages.join('\n');
                    }
					// jesli nie ma danych to 
                    return "Wprowadzono niepoprawne dane";
                }
                else {
					// inne bledy, czli wyjatek ErrorException -> blad 400 i on zwraca propoerty o nazwie error ->> kod serwera
                    // sprawdczenie czy istnieje json, ktore ma takie property
					if (response._data && response._data.error) {
                        return messageMap[response._data.error] ?? response._data.error;
                    }

                    return "Wystąpił błąd";
                }

            }

            return "";
        }
    };
};


// najczesniej uzywane wiadomosci i nazwy pol
// po to zeby nie powielac mapowan, przy kazdym wywolaniu funkccji
const defaultValidationMessages = {
	// notEmptyValidator -> ktory, zwraca validator z logowania, jesli jest regula notEmpty -> kod serwera
    "NotEmptyValidator" : "Pole nie może być puste",
    "EmailValidator" : "Niepoprawny adres email",
}

const defaultFieldNames = {
    "Email" : "Email",
    "Password": "Hasło"
}