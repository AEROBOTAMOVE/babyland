# 14 · ЕЗИК · Шльокавица (латиница): как пишат майките и как се разчита

Произход на таблицата: bg.wikipedia „Шльокавица“ (прочетена в тази сесия, обобщено в WebFetch) + en.wikipedia „Romanization of Bulgarian“ (Streamlined System: ж=zh, ц=ts, ч=ch, ш=sh, щ=sht, ъ=a, ь=y, ю=yu, я=ya, й=y; крайно -ия → -ia). Примерите по-долу са СЪСТАВЕНИ (перифрази), не извадки от форум. Заглавие с шльокавица, видяно чрез търсачка в BG-Mamma: „zahranwaneto e USA“ (?topic=4982) — латиницата влиза и в заглавия.
Статията във Уикипедия подчертава, че шльокавицата НЯМА правила и писачите често са непоследователни дори в собствените си текстове — затова разчитането е по вероятност + речник на домейна, не по таблица.

## 1. Съответствия (кирилица → латиница), всички наблюдавани варианти
(Цифрите и вариантите са по bg.wikipedia; „рядко“ = отбелязани като редки там.)
| Буква | Варианти |
|---|---|
| ч | **ch**, **4**, ~ (рядко: h, c, 5, q) |
| ш | **sh**, **6**, s, w (рядко: ch) |
| щ | **sht**, **6t**, st, 7 (рядко: cht, 6) |
| ъ | **a**, **u**, **y**, 1, w, @ (рядко: 2, 3, `, i) |
| ж | **j**, **zh**, v, g, z |
| ц | **c**, **ts**, tz, z |
| ю | **yu**, **iu**, **ju**, u |
| я | **ya**, **ia**, **ja**, **q**, 9, @ |
| й | **y**, **j**, **i** |
| ь | **y**, **i**, **j**, ' |
| х | h (рядко x) |
| в | v (рядко w) |

## 2. Неяснотите, които объркват (важни за разчитане)
- **y** = ъ, й, ь, у, и: „sym“ → „съм“; „moy“ → „мой“.
- **u** = у, ъ, ю: „sum“ → „съм“ или „сум“; „mu“ → „му“ (!) или „мъ…“.
- **a** = а, ъ, я: „sam“ → „сам/съм“; „kak“ → „как“.
- **q** почти винаги = я („mlqko“ = мляко); но „q“ е също 4-та буква в някои англ. имена.
- **i** = и, й, ь, ия: „moi“ = мой; „dni“ = дни.
- **c** = ц, с, ч („cqlo“ = цяло; „cyl“ = цял).
- **shte / 6te** = най-често „ще“ (бъдеще време), макар по буквите да се чете „ште“; **sht / 6t** = щ („6t“ = цифра 6 + t).
- **Цифрите 4 и 6 са два вида**: самостоятелно число („na 4 meseca“ = на 4 месеца) или буква ч/ш, когато са залепени в дума („4asa“). Правилото: цифра **между букви без интервал** = буква; **цифра отделно** = число. „6 4asa“ = „6 часа“.
- Главни букви и цифри в **спешно** писане: „POMO6T“ = „ПОМОЩ“; „BEBETO NE DI6A“ = „бебето не диша“.
- Знаци ( ) използвани за усмивка: „))))“; :( ; хаха като „haha“.
- **Хибридно** писане: кирилица + латиница на обрат („Здравейте мами имам въпрос za kolikite“) — често при мобилни клавиатури, превключване.

## 3. Алгоритъм за помощничката (на практика)
1. Засечи шльокавица: >30% от думите съдържат латински букви без кирилица; или присъстват „q“, „4/6“ в думи.
2. Нормализирай: малки букви; сложи интервали около числа; **greedy** замени триграфи: „sht“→щ, „6t“→щ; после диграфи: „sh“→ш, „ch“→ч, „zh“→ж, „ts“→ц, „yu/iu/ju“→ю, „ya/ia/ja“→я; после единични: „q“→я, „4“→ч, „6“→ш, „j“→ж (или й!), „y“→ъ или й, „u“→у или ъ, „a“→а или ъ.
3. Двусмислените букви (**a/u/y/j/i/c**) се разрешават по **речник на домейна**: пази списък със стотици думи от тези файлове (напр. „kolik“, „mlqko“, „pamperc“, „zahranvane“, „kurmq“, „temperatura“, „zubki“, „pelena“, „gurne/gyrne“, „spinka“, „nani“) и избирай варианта с най-голямо съвпадение.
4. Ако остане двусмислие — **не питай „какво имаш предвид“**; отговори на най-вероятното четене и го потвърди с половин изречение: „Разбрах, че питаш за колики — ако съм разбрала грешно, кажи“.
5. **Аларма:** ако текстът е на шльокавица **и** съдържа сигнални думи (POMO6T, spe6no, ne di6a, ne se budi, kryv, posinq, gur4), третирай като кирилица с висока тревога (виж 15-trevoga).
6. Отговаряй на **кирилица**, освен ако майката не е ясно поискала латиница.

## 4. Примери (латиница → кирилица). Стил: A цифри 4/6 + q · B ch/sh/sht/zh + ya/yu · C смесен/небрежен · D главни/спешно

### Бременност
| Шльокавица | Кирилица | Стил |
|---|---|---|
| kak da razbera che sum bremenna | как да разбера че съм бременна | B |
| dva testa i dvata sa polojitelni | два теста и двата са положителни | C |
| zakasnqvam 6 dni a testat e otricatelen | закъснявам 6 дни а тестът е отрицателен | A |
| koga da otida na lekar sled polojitelen test | кога да отида на лекар след положителен тест | C |
| mazne mi kafqvo dali e opasno | мазне ми кафяво дали е опасно | A |
| gadq se po cql den i povru6tam | гадя се по цял ден и повръщам | A |
| mnogo sum umorena zaspivam na krak | много съм уморена заспивам на крак | C |
| koga e dvoiniqt test i zaduljitelen li e | кога е двойният тест и задължителен ли е | A |
| kolko kafeta na den moje da pie bremenna | колко кафета на ден може да пие бременна | A |
| koga se pravi morfologi4noto eho | кога се прави морфологичното ехо | A |
| iztekoha mi vodite ili e tapata | изтекоха ми водите или е тапата | C |
| kontrakciite sa na 5 minuti da trugvam li | контракциите са на 5 минути да тръгвам ли | C |
| sekcio ili normalno rajdane kak da reshq | секцио или нормално раждане как да реша | A |
| epiduralnata boli li | епидуралната боли ли | C |
| kakvo da sloja v 4antata za rodilnoto | какво да сложа в чантата за родилното | A |
| minah termina s 4 dni i nishto | минах термина с 4 дни и нищо | B |

### Новородено
| Шльокавица | Кирилица | Стил |
|---|---|---|
| pupcheto o6te ne e padnalo na 12 den | пъпчето още не е паднало на 12 ден | A |
| bebeto pojultq na liceto normalno li e | бебето пожълтя на лицето нормално ли е | A |
| akoto mu e zeleno i penlivo | акото му е зелено и пенливо | C |
| ne e akal 3 dni zapek li e | не е акал 3 дни запек ли е | C |
| vsqka vecher reve po 3 chasa koliki li sa | всяка вечер реве по 3 часа колики ли са | A |
| da mu dam li espumizan | да му дам ли еспумизан | C |
| spi cql den a no6tem ne spi | спи цял ден а нощем не спи | A |
| hurka kato spi normalno li e | хърка като спи нормално ли е | C |
| ima 37.9 na 3 sedmici kakvo da pravq | има 37.9 на 3 седмици какво да правя | A |
| kojata mu se lyushti po krakata | кожата му се лющи по краката | B |
| o4ite mu sa lepnati sutrin | очите му са лепнати сутрин | A |
| bebeto ne iska da suche i plache | бебето не иска да суче и плаче | B |

### Кърмене
| Шльокавица | Кирилица | Стил |
|---|---|---|
| kurmq i mnogo me boli | кърмя и много ме боли | C |
| nqmam mlqko bebeto pla4e | нямам мляко бебето плаче | A |
| zyrnata mi sa napukani | зърната ми са напукани | C |
| gurdite mi sa tvurdi kato kamyk | гърдите ми са твърди като камък | C |
| kolko stoi izcedeno mlqko v hladilnika | колко стои изцедено мляко в хладилника | A |
| koga da otbiq bebeto | кога да отбия бебето | A |
| visi na gurdata cql den | виси на гърдата цял ден | A |
| mlqkoto mi namalq laktacionna kriza li e | млякото ми намаля лактационна криза ли е | A |
| mastit li e s temperatura 38 | мастит ли е с температура 38 | C |

### Захранване и хранене
| Шльокавица | Кирилица | Стил |
|---|---|---|
| ot koga se po4va zahranvane | от кога се почва захранване | A |
| s kakvo da zapo4na purvo tikva ili morkov | с какво да започна първо тиква или морков | A |
| ne iska lujicata stiska ustata | не иска лъжицата стиска устата | C |
| zadavi se i posinq | задави се и посиня | A |
| izlqzoha mu 4erveni petna po buzite | излязоха му червени петна по бузите | A |
| koga se dava voda | кога се дава вода | C |
| moga li da davam med | мога ли да давам мед | C |
| krave mlqko ot koga | краве мляко от кога | A |
| qde samo hlqb i makaroni | яде само хляб и макарони | A |
| burkan4eta ili doma6no piure | бурканчета или домашно пюре | A |
| zloyad e ne iska da qde | злояд е не иска да яде | B |
| kolko mlqko da pie sled zahranvaneto | колко мляко да пие след захранването | A |

### Сън
| Шльокавица | Кирилица | Стил |
|---|---|---|
| kak da go nau4a da zaspiva sam | как да го науча да заспива сам | A |
| budi se na vseki 4as | буди се на всеки час | A |
| regresiq na sunq na 4 meseca | регресия на съня на 4 месеца | A |
| kolko drqmki trqbva da ima | колко дрямки трябва да има | A |
| lqga v 10 vecherta | ляга в 10 вечерта | A |
| stava v 5 sutrinta | става в 5 сутринта | C |
| zaspiva samo na gurda | заспива само на гърда | C |
| bql 6um ili ti6ina | бял шум или тишина | A |
| spim v na6eto leglo | спим в нашето легло | A |
| spinka i nani no ne zaspiva | спинка и нани но не заспива | C |

### Развитие
| Шльокавица | Кирилица | Стил |
|---|---|---|
| koga prohodi | кога проходи | C |
| na 5 meseca ne se obru6ta | на 5 месеца не се обръща | A |
| ne pulzi a se vla4i po dupe | не пълзи а се влачи по дупе | A |
| dali zakasnqva da govori | дали закъснява да говори | A |
| na 2 godini kazva samo mama | на 2 години казва само мама | C |
| niknat mu zubki | никнат му зъбки | C |
| 39 temperatura ot zubi li e | 39 температура от зъби ли е | C |
| na 3-ti percentil e za tegloto | на 3-ти перцентил е за теглото | C |
| hape drugite deca | хапе другите деца | C |
| pada na zemqta i reve | пада на земята и реве | C |
| ne iska da hodi na gurne | не иска да ходи на гърне | C |

### Здраве
| Шльокавица | Кирилица | Стил |
|---|---|---|
| vdigna temperatura 39 kakvo da davam | вдигна температура 39 какво да давам | C |
| nurofen ili paracetamol | нурофен или парацетамол | C |
| ka6lq kato ku4e lae | кашля като куче лае | A |
| hremata ne svur6va | хремата не свършва | A |
| povru6ta i ima diariq | повръща и има диария | A |
| izbi go po tqloto | изби го по тялото | A |
| obriv i temperatura zaedno | обрив и температура заедно | C |
| koga sa vaksinite | кога са ваксините | C |
| vaksina i temperatura sled neq | ваксина и температура след нея | A |
| uhoto go boli i teche | ухото го боли и тече | B |
| padna i udari glavata | падна и удари главата | C |
| glutna moneta pomo6t | глътна монета помощ | A |

### Майката
| Шльокавица | Кирилица | Стил |
|---|---|---|
| pla4a bez pri4ina | плача без причина | A |
| umorena sum i ne moga poveche | уморена съм и не мога повече | B |
| izpada mi kosata | изпада ми косата | C |
| koga idvat mese4nite | кога идват месечните | A |
| ne 4uvstvam ni6to kum bebeto | не чувствам нищо към бебето | A |
| losha majka li sum | лоша майка ли съм | C |
| strah me e da ostana sama s nego | страх ме е да остана сама с него | C |
| mujat ne pomaga s nishto | мъжът не помага с нищо | B |

### Семейство
| Шльокавица | Кирилица | Стил |
|---|---|---|
| svekurva mi se mesi vuv vsi4ko | свекърва ми се меси във всичко | A |
| baba mu dava slatko taino | баба му дава сладко тайно | C |
| ne iskam da me celuvat vsi4ki po bebeto | не искам да ме целуват всички по бебето | A |
| bashtata ne plashta izdrujka | бащата не плаща издръжка | B |

### Пари и документи
| Шльокавица | Кирилица | Стил |
|---|---|---|
| kolko dni e majchinstvoto | колко дни е майчинството | B |
| kakvi dokumenti trqbvat za NOI | какви документи трябват за НОИ | C |
| kude se pravi aktyt za rajdane | къде се прави актът за раждане | C |
| ednokratnata pomo6t kolko e | еднократната помощ колко е | A |
| bele6ka ot li4niq za gradina | бележка от личния за градина | A |
| kak da zapi6a bebeto pri li4en lekar | как да запиша бебето при личен лекар | A |
| bolni4en za gledane na bolno dete | болничен за гледане на болно дете | A |

### Ясла и градина
| Шльокавица | Кирилица | Стил |
|---|---|---|
| ot kolko meseca se priema v qsla | от колко месеца се приема в ясла | A |
| pla4e vsqka sutrin na vratata | плаче всяка сутрин на вратата | A |
| bolnee otkakto trugna na gradina | болнее откакто тръгна на градина | C |
| kakvo da slagam v kutiqta za gradinata | какво да слагам в кутията за градината | A |
| gradinata iska bez pampers | градината иска без памперс | C |
| koga trugva na u4ili6te | кога тръгва на училище | A |

### Спешно (главни букви, често без интервали/пунктуация)
| Шльокавица | Кирилица |
|---|---|
| POMO6T BEBETO NE DI6A | ПОМОЩ БЕБЕТО НЕ ДИША |
| SPE6NO POSINQ I NE SE BUDI | СПЕШНО ПОСИНЯ И НЕ СЕ БУДИ |
| GLUTNA BATERIQ SPE6NO | ГЛЪТНА БАТЕРИЯ СПЕШНО |
| KURVQ MNOGO NA 7 G.S. | КЪРВЯ МНОГО НА 7 Г.С. |
| UDARI GLAVATA I POVRU6TA | УДАРИ ГЛАВАТА И ПОВРЪЩА |
| 40 GRADUSA I GUR4 | 40 ГРАДУСА И ГЪРЧ |
| NE ME 4UVA DETETO NE REAGIRA | НЕ МЕ ЧУВА ДЕТЕТО НЕ РЕАГИРА |

### Хибриден запис (кирилица + латиница в едно съобщение)
- „Здравейте мами имам въпрос za kolikite“ → Здравейте мами имам въпрос за коликите.
- „бебето ми е на 2 meseca i ne spi“ → бебето ми е на 2 месеца и не спи.
- „Момичета pampers или libero?“ → Момичета памперс или либеро?
- „Помощ! temperatura 39 a e samo 3 meseca“ → Помощ! температура 39 а е само 3 месеца (спешно!).
- „mnogo me e strah ot rajdaneto“ → много ме е страх от раждането.
- „НОИ kolko dni davat“ → НОИ колко дни дават.

**Брой примерни въпроси на шльокавица в този файл: 120 (114 в таблици + 6 хибридни; броят е от преброяване на редовете в таблиците и списъка, не от оценка).**

**Източници:** bg.wikipedia „Шльокавица“ (медия/референтна, таблица на вариантите; WebFetch в тази сесия); en.wikipedia „Romanization of Bulgarian“ (Streamlined System); BG-Mamma заглавие ?topic=4982 (чрез търсачка); примерите — съставени (ПРЕДПОЛОЖЕНО, не са извадка).
