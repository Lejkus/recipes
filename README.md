https://github.com/user-attachments/assets/f8e6b833-9f4a-4e78-a95a-0beab88a7220



PysznePrzepisy.pl – Social App dla Miłośników Gotowania
PysznePrzepisy.pl to nowoczesna aplikacja webowa typu SPA (Single Page Application), stworzona z myślą o pasjonatach kulinariów. Platforma pozwala użytkownikom na wygodne zarządzanie własnymi recepturami, odkrywanie inspiracji od innych kucharzy oraz interakcję z całą społecznością. Dzięki pełnej responsywności i dynamicznemu interfejsowi, korzystanie z przepisów podczas gotowania jest proste i przyjemne.

Główne Funkcjonalności
Prywatna Książka Kucharska ("Moje Przepisy"): Miejsce, w którym użytkownik ma pełen wgląd w dodane przez siebie potrawy.

System Zapisywania i Polubień: Możliwość błyskawicznego zapisywania ulubionych dań (widoczne w sekcji "Zapisane"), aby mieć do nich szybki dostęp.

Publikacja i Dzielenie się ze Społecznością: Użytkownicy mogą decydować, czy ich przepis ma pozostać prywatny, czy trafić do zakładki "Publiczne przepisy", gdzie każdy może z niego skorzystać.

Interaktywny Kreator Przepisów: Intuicyjny formularz umożliwiający dynamiczne dodawanie składników (wraz z jednostkami), przypisywanie kategorii (np. śniadanie, słodkie, słone) oraz wgrywanie zdjęć gotowych dań za pomocą wygodnego modułu przeciągnij-i-upuść (Drag & Drop).

System Opinii i Ocen: Możliwość oceniania potraw w skali 5-gwiazdkowej oraz sekcja komentarzy, pozwalająca na dzielenie się uwagami z innymi użytkownikami (np. "super przepis!!!").

Zaawansowane Filtrowanie i Wyszukiwarka: Filtrowanie potraw po kategoriach, wyszukiwanie tekstowe oraz szybkie sortowanie dań ("Z oceną", "Ze zdjęciem", "Wszystko").

Interaktywna Lista Składników: Możliwość odhaczania (wykreślania) posiadanych lub przygotowanych składników na podglądzie przepisu.

Stack Technologiczny
Frontend
React (v18) – biblioteka główna odpowiedzialna za reaktywny i komponentowy interfejs użytkownika.

TypeScript – pełne typowanie kodu zapewniające stabilność i wysoką jakość aplikacji.

Vite – ultraszybkie narzędzie do budowania i serwowania aplikacji deweloperskiej.

SASS (SCSS) – zaawansowane stylowanie elementów wizualnych, zapewniające spójny design i pełną responsywność.

React Router DOM (v6) – płynna nawigacja pomiędzy podstronami bez przeładowywania ekranu.

FontAwesome – nowoczesny zestaw ikon ułatwiający nawigację po interfejsie.

Backend / Usługi w chmurze (Firebase)
Firebase Authentication – bezpieczne logowanie użytkowników (w tym integracja z dostawcą Google Auth).

Cloud Firestore – nierelacyjna baza danych (NoSQL) przechowująca informacje o przepisach, komentarzach, ocenach i relacjach użytkowników w czasie rzeczywistym.

Firebase Storage – chmura dedykowana do przechowywania i serwowania zdjęć potraw przesyłanych przez użytkowników.
