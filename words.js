export const validStrForTextToTypeRegex = /^[a-záéíóöőúüűäß0-9`~!@#$%^&*()_ =+\[\]{}\\|;:'",.<>\/?€£¥-]+$/iu;

const unfilteredWords = {
    English: [
        "the", "of", "and", "a", "to", "in", "he", "have", "it", "that", 
        "for", "they", "i", "with", "as", "not", "on", "she", "at", "by", 
        "this", "we", "you", "do", "but", "from", "or", "which", "one", "would", 
        "all", "will", "there", "say", "who", "make", "when", "can", "more", "if", 
        "no", "man", "out", "other", "so", "what", "time", "up", "go", "about", 
        "than", "into", "could", "state", "only", "new", "year", "some", "take", "come", 
        "these", "know", "see", "use", "get", "like", "then", "first", "any", "work", 
        "now", "may", "such", "give", "over", "think", "most", "even", "find", "day", 
        "also", "after", "way", "many", "must", "look", "before", "great", "back", "through", 
        "long", "where", "much", "should", "well", "people", "down", "own", "just", "because", 
        "good", "each", "those", "feel", "seem", "how", "high", "too", "place", "little", 
        "world", "very", "still", "nation", "hand", "old", "life", "tell", "write", "become", 
        "here", "show", "house", "both", "between", "need", "mean", "call", "develop", "under", 
        "last", "right", "move", "thing", "general", "school", "never", "same", "another", "begin", 
        "while", "number", "part", "turn", "real", "leave", "might", "want", "point", "form", 
        "off", "child", "few", "small", "since", "against", "ask", "late", "home", "interest", 
        "large", "person", "end", "open", "public", "follow", "during", "present", "without", "again", 
        "hold", "govern", "around", "possible", "head", "consider", "word", "program", "problem", "however", 
        "lead", "system", "set", "order", "eye", "plan", "run", "keep", "face", "fact", 
        "group", "play", "stand", "increase", "early", "course", "change", "help", "line"
    ],

    Hungarian: [
        "a", "nem", "az", "hogy", "és", "egy", "van", "ez", "is", "meg", 
        "de", "csak", "mi", "én", "ha", "azt", "vagy", "itt", "igen", "volt", 
        "ne", "el", "már", "te", "kell", "ki", "még", "mit", "jó", "vagyok", 
        "ezt", "most", "mint", "tudom", "miért", "úgy", "akkor", "jól", "ő", "lesz", 
        "nagyon", "nincs", "minden", "be", "le", "sem", "rendben", "ott", "olyan", "mert", 
        "így", "nekem", "fel", "amit", "tudod", "majd", "volna", "maga", "köszönöm", "hát", 
        "hol", "valami", "gyerünk", "vissza", "sok", "először", "soha", "áll", "szó", "nap", 
        "év", "ember", "idő", "hely", "kéz", "mód", "szem", "víz", "perc", "után", 
        "mostanában", "mindig", "gondol", "tudni", "mond", "lát", "ad", "kap", "tesz", "jön", 
        "megy", "keres", "marad", "érz", "ér", "akar", "érdekes", "jobb", "régen", "utolsó", 
        "más", "ide", "ott", "ideje", "nélkül", "alatt", "fölött", "között", "valamiért", "tovább", 
        "elé", "közel", "messze", "rajta", "rajta", "alapján", "szerint", "ok", "munka", "tanul", 
        "iskola", "szép", "kicsi", "nagy", "igaz", "rossz", "hideg", "meleg", "hűvös", "forró", 
        "szeret", "szerelem", "barát", "család", "otthon", "szoba", "utca", "város", "ország", "helyzet", 
        "probléma", "ötlet", "lehetőség", "kérdés", "válasz", "dolog", "történet", "film", "zene", "könyv", 
        "játék", "verseny", "munkahely", "program", "rendszer", "szám", "helyes", "hiba", "siker", "győz", 
        "veszít", "állat", "emberi", "természet", "napok", "éjszaka", "hét", "óra", "perc", "második", 
        "harmadik", "első", "utolsó", "két", "három", "négy", "öt", "hat", "hét", "nyolc", 
        "kilenc", "tíz", "száz", "ezer", "teljes", "rész", "egész", "kételkedik", "biztos", "talán", 
        "remél", "hisz", "látogató", "vendég", "üdvözöl", "búcsúzik", "számít", "segít", "tart", "működik", 
        "változik", "kezd", "fejez", "nyit", "zár", "néz", "hall", "szól", "ír", "olvas"
    ],

    German: [
        "der", "die", "und", "ein", "zu", "in", "er", "haben", "es", "dass", 
        "für", "sie", "ich", "mit", "als", "nicht", "auf", "sein", "bei", "von", 
        "dies", "wir", "du", "tun", "aber", "aus", "oder", "welche", "eins", "würde", 
        "alle", "werden", "dort", "sagen", "wer", "machen", "wann", "kann", "mehr", "wenn", 
        "kein", "mann", "aus", "andere", "so", "was", "zeit", "oben", "gehen", "über", 
        "als", "in", "könnte", "staat", "nur", "neu", "jahr", "einige", "nehmen", "kommen", 
        "diese", "wissen", "sehen", "benutzen", "bekommen", "mögen", "dann", "erste", "irgend", "arbeiten", 
        "jetzt", "dürfen", "solche", "geben", "über", "denken", "meist", "sogar", "finden", "tag", 
        "auch", "nach", "weg", "viele", "müssen", "schauen", "vor", "groß", "zurück", "durch", 
        "lang", "wo", "viel", "sollte", "gut", "leute", "unten", "eigen", "nur", "weil", 
        "gut", "jede", "jene", "fühlen", "scheinen", "wie", "hoch", "zu", "ort", "klein", 
        "welt", "sehr", "noch", "nation", "hand", "alt", "leben", "erzählen", "schreiben", "werden", 
        "hier", "zeigen", "haus", "beide", "zwischen", "brauchen", "meinen", "nennen", "entwickeln", "unter", 
        "letzte", "richtig", "bewegen", "ding", "allgemein", "schule", "nie", "gleich", "andere", "beginnen", 
        "während", "nummer", "teil", "drehen", "real", "verlassen", "könnten", "wollen", "punkt", "form", 
        "aus", "kind", "wenige", "klein", "seit", "gegen", "fragen", "spät", "heim", "interesse", 
        "groß", "person", "ende", "öffnen", "öffentlich", "folgen", "während", "gegenwart", "ohne", "wieder", 
        "halten", "regieren", "um", "möglich", "kopf", "betrachten", "wort", "programm", "problem", "jedoch", 
        "führen", "system", "setzen", "ordnung", "auge", "plan", "laufen", "halten", "gesicht", "tatsache", 
        "gruppe", "spielen", "stehen", "erhöhen", "früh", "kurs", "ändern", "helfen", "linie"
    ]
};

export const words = Object.fromEntries(
    Object.entries(unfilteredWords).map(
        ([languageName, arr]) => [languageName, arr.filter(word => validStrForTextToTypeRegex.test(word))]
    )
);