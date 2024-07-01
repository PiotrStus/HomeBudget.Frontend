import { hash } from 'ohash'

// ta metoda useWebApiFetch będzie dostępna w każdym komponencie, ponieważ znajduje się
// w utils i to własnie Nuxt nam załatwia

export const useWebApiFetch = function (request, opts) {
	// używamy composable useRuntimeConfig, po to, zeby 
	// pozniej ze zmiennej srodowiskowej wyciagnac adres api
	// adres do API bedziemy definiowac w innym miejscu
    const config = useRuntimeConfig()

	// parsowanie wiadomosci -> zamiana na przyjazny komunikat
	const { getErrorMessage } = useWebApiResponseParser();
	// globalMessageStore
	const globalMessageStore = useGlobalMessageStore();

	const antiForgeryStore = useAntiForgeryStore();


	// jesli opcje nie istnieja to tworzymy pusty obiekt
	opts = opts || {};
	// tak samo z header
	opts.headers = opts.headers || {};
	// jesli mamy juz ten headers to ustawiamy naglowek zgodnie z dokumentacja
	// i przypisujemy token zapisany w storze
	opts.headers['X-XSRF-TOKEN'] = antiForgeryStore.$state.token;


	// wyciagniecie adresu API -> base URL
    return useFetch(request, { baseURL: config.public.BASE_URL,
        onRequest({ request, options }) {
          // metody w ktore mozemy wpiac jakies dodatkowe rzeczy
		  // logowanie czy cos innego co bedziemy potrzebowac
        },
        onRequestError(context) {

        },
        onResponse({ request, response, options }) {

        },
        onResponseError({ request, response, options }) {
			// GLOBALNA OBSLUGA BLEDOW
			// czyli jesli ta funkcja nie zostanie nadpisana przy jakims
			// requescie a wystapi blad to wyswietli sie takie okienko z bledem
			const message = getErrorMessage(response, {});
			globalMessageStore.showErrorMessage(message);
            // obsluga globalna bledow
			// jak bedzie jakis np. blad w komunikacji z api
        },
		// sluzy do tego aby w requestach ajaxowych byly zawarte cookies
        credentials: 'include',
		// key -> to jest paramter uzywany w useFetch do deduplikacji requestow
		// czyli jesli mamy dwa komponenty na stronie, ktore strzelaja dokladnie
		// pod ten sam adres to tak naprawde ta biblioteka nuxt strzeli tylko raz
		// i jak dostanie odpowiedz z api to w obu requestach zwroci te same dane
		// natomiast domyslnie dziala na podsatwie adresu url i jakis parametrow, ale to nie do konca dobrze dziala
		// dlatego tworzymy tutaj wlasna implementacje wyliczania tego klucza
		// ciag znakow 
		// 'webapi-fetch'
		// nasz request
		// body, ktore wysylamy z requesta
		// parametry z requesta
		// metoda np. POST, GET z requesta
		// i query
		// i inne opcje ... opts do przekazania do metody
        key : hash(['webapi-fetch', request, opts?.body, opts?.params, opts?.method, opts?.query]),
        ...opts});
}