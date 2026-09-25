/** Guia de suplementos: conteúdo educativo exibido no menu ☰ (carregado só quando a guia é aberta). */

export type Evidencia = "Forte" | "Moderada" | "Fraca";
export interface Suplemento {
  id: string;
  nome: string;
  serve: string;
  resumo: string;
  evidencia: Evidencia;
  evidenciaNota?: string;
  /** Suplementos com restrições importantes: o bloco "quem não deve tomar" aparece em destaque no topo. */
  restricao?: boolean;
  oque: string;
  beneficios: string[];
  melhorHorario: string;
  porqueMelhor: string;
  evitar: string;
  porqueEvitar: string;
  quemDeve: string[];
  quemNaoDeve: string[];
  dose: string;
  mitos: [string, string][];
}

export const aviso =
  "Conteúdo educativo. Não substitui a orientação de nutricionista ou médico. Antes de usar qualquer suplemento — principalmente se você tem alguma doença, usa medicamentos, está grávida ou amamentando — converse com um profissional de saúde.";

export const suplementos: Suplemento[] = [
  {
    id: "whey",
    serve: "Completar a proteína do dia para ganhar e manter massa muscular e acelerar a recuperação pós-treino.",
    nome: "Whey Protein",
    resumo: "Proteína do soro do leite, de rápida digestão.",
    evidencia: "Forte",
    oque: "Proteína extraída do soro do leite, rica em aminoácidos essenciais (principalmente leucina). Existe em três tipos: concentrado (mais barato, tem um pouco de lactose), isolado (quase sem lactose e gordura) e hidrolisado (pré-digerido, absorção mais rápida).",
    beneficios: [
      "Ajuda a atingir a meta diária de proteína de forma prática.",
      "Estimula a síntese de proteína muscular — apoia ganho e manutenção de massa magra.",
      "Aumenta a saciedade, útil em dietas de emagrecimento.",
      "Contribui para a recuperação após o treino.",
    ],
    melhorHorario: "Após o treino ou em refeições com pouca proteína (café da manhã, lanches).",
    porqueMelhor: "O que mais importa é o total de proteína no dia. Distribuir a proteína em 3 a 5 refeições de 20–40 g cada mantém a síntese muscular estimulada ao longo do dia; o pós-treino é um momento prático para uma dessas doses.",
    evitar: "Como substituto de refeições completas de forma rotineira.",
    porqueEvitar: "O whey não tem fibras, vitaminas e minerais de uma refeição de verdade. Ele complementa a dieta, não a substitui.",
    quemDeve: [
      "Quem treina e não consegue atingir a meta de proteína só com a alimentação.",
      "Pessoas com rotina corrida que precisam de uma fonte prática de proteína.",
      "Idosos, para ajudar a preservar a massa muscular.",
    ],
    quemNaoDeve: [
      "Pessoas com alergia à proteína do leite (diferente de intolerância à lactose).",
      "Intolerantes à lactose: preferir o isolado ou o hidrolisado.",
      "Quem tem doença renal: somente com orientação médica.",
    ],
    dose: "20–40 g por dose (1 a 2 scoops). Meta diária total de proteína para quem treina: 1,6–2,2 g por kg de peso corporal, somando comida e suplemento.",
    mitos: [
      ["“Whey faz mal para os rins.”", "Em pessoas saudáveis, não há evidência de dano renal. O cuidado é para quem já tem doença renal."],
      ["“Tem que tomar em até 30 minutos depois do treino.”", "A chamada janela anabólica é bem maior do que se pensava; o total diário importa mais que o minuto exato."],
      ["“Whey engorda.”", "Engorda o excesso de calorias no dia. Uma dose tem em média 100–130 kcal."],
    ],
  },
  {
    id: "creatina",
    serve: "Aumentar força e potência, render mais repetições por série e favorecer o ganho de massa muscular.",
    nome: "Creatina",
    resumo: "O suplemento mais estudado para força e desempenho.",
    evidencia: "Forte",
    oque: "Substância produzida naturalmente pelo corpo e encontrada em carnes e peixes. Fica armazenada nos músculos como fosfocreatina, que gera energia rápida para esforços curtos e intensos. A forma mais estudada e recomendada é a creatina monohidratada.",
    beneficios: [
      "Aumento de força e potência em exercícios de alta intensidade.",
      "Mais repetições por série, o que favorece o ganho de massa muscular.",
      "Melhora a recuperação entre séries e entre treinos.",
      "Possíveis benefícios cognitivos, especialmente em privação de sono e em idosos.",
    ],
    melhorHorario: "Qualquer horário do dia, todos os dias — de preferência junto a uma refeição ou no pós-treino.",
    porqueMelhor: "A creatina age por saturação dos músculos, que acontece com o uso diário contínuo por algumas semanas. Por isso a constância importa muito mais que o horário. Tomar com refeição (carboidrato + proteína) pode melhorar levemente a absorção.",
    evitar: "Não há horário proibido. O erro é tomar só nos dias de treino.",
    porqueEvitar: "Pular dias reduz a saturação muscular e diminui o efeito. Nos dias de descanso a dose é a mesma.",
    quemDeve: [
      "Praticantes de musculação e esportes de força, explosão ou sprints.",
      "Vegetarianos e veganos (costumam ter estoques menores e respondem melhor).",
      "Idosos, associada ao treino de força, para preservar massa e força.",
    ],
    quemNaoDeve: [
      "Pessoas com doença renal ou histórico de problema nos rins (somente com orientação médica).",
      "Gestantes e lactantes (faltam estudos de segurança).",
      "Menores de 18 anos sem acompanhamento profissional.",
    ],
    dose: "3–5 g por dia, todos os dias. A fase de saturação (cerca de 20 g/dia divididos em 4 doses por 5–7 dias) é opcional — só acelera o efeito.",
    mitos: [
      ["“Creatina faz cair o cabelo.”", "A ideia vem de um único estudo pequeno de 2009 que nunca foi confirmado. Até hoje não há evidência de que cause queda de cabelo."],
      ["“Creatina estraga os rins.”", "Em pessoas saudáveis, décadas de estudos não mostram dano renal. Ela pode elevar o exame de creatinina sem que isso signifique problema — avise seu médico que usa."],
      ["“Creatina incha.”", "O ganho de 1–2 kg no início é água dentro do músculo, não retenção sob a pele."],
      ["“Precisa fazer ciclos.”", "Não há necessidade de pausas; o uso contínuo é seguro nos estudos de longo prazo."],
    ],
  },
  {
    id: "cafeina",
    serve: "Dar energia e foco, diminuir a sensação de cansaço e melhorar o rendimento no treino.",
    nome: "Cafeína",
    resumo: "Estimulante que aumenta disposição, foco e desempenho.",
    evidencia: "Forte",
    restricao: true,
    oque: "Estimulante natural do sistema nervoso central, presente no café, chás, chocolate e em cápsulas. Bloqueia a adenosina, substância que causa a sensação de cansaço.",
    beneficios: [
      "Mais disposição, foco e estado de alerta.",
      "Menor percepção de esforço — o treino parece mais leve.",
      "Melhora de desempenho em força, resistência e esportes intermitentes.",
      "Pequeno aumento do gasto calórico.",
    ],
    melhorHorario: "30 a 60 minutos antes do treino.",
    porqueMelhor: "É o tempo para a cafeína atingir o pico no sangue, coincidindo com o treino.",
    evitar: "Nas 6 a 8 horas antes de dormir (na prática: evitar após o meio da tarde).",
    porqueEvitar: "A cafeína leva cerca de 5 horas para cair pela metade no organismo. Mesmo sem perceber, ela reduz a qualidade do sono profundo — e o sono é essencial para a recuperação e o ganho de massa.",
    quemDeve: [
      "Adultos saudáveis que toleram bem a cafeína e querem melhorar o rendimento no treino.",
      "Quem treina cedo ou precisa de mais foco na sessão.",
    ],
    quemNaoDeve: [
      "Hipertensos (pressão alta), principalmente sem controle.",
      "Pessoas com arritmia ou outras doenças cardíacas.",
      "Gestantes (limite máximo de 200 mg/dia somando todas as fontes, com orientação médica) e lactantes.",
      "Quem tem ansiedade, síndrome do pânico ou insônia.",
      "Quem tem gastrite ou refluxo.",
      "Menores de 18 anos.",
      "Quem usa medicamentos que interagem com estimulantes — consulte o médico.",
    ],
    dose: "3–6 mg por kg de peso corporal antes do treino (ex.: 70 kg → 210–420 mg). Comece pela menor dose. Limite para adultos saudáveis: 400 mg por dia, somando café, chás, refrigerantes e pré-treinos.",
    mitos: [
      ["“Quanto mais, melhor.”", "Acima de 6 mg/kg os benefícios não aumentam, mas os efeitos colaterais (taquicardia, tremores, ansiedade) sim."],
      ["“Cafeína desidrata.”", "Em quem consome com frequência, o efeito diurético é pequeno e não causa desidratação."],
      ["“Tolerância faz perder todo o efeito.”", "O efeito diminui um pouco com o uso diário, mas continua presente. Ciclos de pausa são opcionais."],
    ],
  },
  {
    id: "pre-treino",
    serve: "Aumentar energia, foco e resistência durante o treino, com sensação de “pump” muscular.",
    nome: "Pré-treino",
    resumo: "Mistura de ingredientes para energia e desempenho no treino.",
    evidencia: "Moderada",
    evidenciaNota: "depende dos ingredientes",
    restricao: true,
    oque: "Produto que combina vários ingredientes numa só dose — geralmente cafeína, beta-alanina, citrulina, arginina, taurina e creatina. O efeito depende da fórmula e da dose de cada ingrediente, que varia muito entre marcas.",
    beneficios: [
      "Mais energia e foco (principalmente pela cafeína).",
      "Sensação de maior vascularização, a chamada “pump” (citrulina, arginina).",
      "Melhor resistência em séries longas (beta-alanina).",
    ],
    melhorHorario: "20 a 40 minutos antes do treino.",
    porqueMelhor: "É o tempo para os estimulantes e a citrulina fazerem efeito junto com o início do treino.",
    evitar: "À noite e em treinos após o fim da tarde.",
    porqueEvitar: "A maioria dos pré-treinos tem 150–350 mg de cafeína por dose, o que atrapalha o sono e a recuperação.",
    quemDeve: [
      "Adultos saudáveis que já toleram bem a cafeína.",
      "Quem sente falta de energia para treinar e já cuidou de sono e alimentação.",
    ],
    quemNaoDeve: [
      "Hipertensos e pessoas com doenças cardíacas ou arritmia.",
      "Gestantes e lactantes.",
      "Menores de 18 anos.",
      "Pessoas sensíveis a estimulantes, com ansiedade ou insônia.",
      "Quem já consome muito café ou usa termogênico (risco de somar doses altas de cafeína).",
      "Atletas que passam por exame antidoping: há risco de contaminação com substâncias proibidas.",
    ],
    dose: "Seguir o rótulo, começando com meia dose para testar a tolerância. Verifique a quantidade de cafeína por dose e evite fórmulas com “blend proprietário” que não informam a quantidade de cada ingrediente.",
    mitos: [
      ["“O formigamento significa que está funcionando.”", "O formigamento vem da beta-alanina e é inofensivo, mas não indica que o treino será melhor."],
      ["“Sem pré-treino não dá para treinar bem.”", "Sono, alimentação e hidratação têm muito mais impacto. Um café pode ter efeito semelhante."],
    ],
  },
  {
    id: "beta-alanina",
    serve: "Atrasar a fadiga e a “queimação” muscular, aguentando mais em séries longas e esforços intensos.",
    nome: "Beta-alanina",
    resumo: "Aminoácido que retarda a fadiga em esforços intensos.",
    evidencia: "Moderada",
    evidenciaNota: "forte para esforços de 1 a 4 minutos",
    oque: "Aminoácido que aumenta a carnosina nos músculos. A carnosina neutraliza a acidez gerada em exercícios intensos, atrasando a sensação de “queimação” e a fadiga.",
    beneficios: [
      "Mais resistência em esforços intensos de 1 a 4 minutos.",
      "Pode permitir algumas repetições a mais em séries longas.",
      "Útil em treinos intervalados, CrossFit, lutas, remo e natação.",
    ],
    melhorHorario: "Qualquer horário, dividido em doses ao longo do dia, junto às refeições.",
    porqueMelhor: "O efeito vem do acúmulo de carnosina após 4 semanas ou mais de uso diário, não da dose do dia. Dividir as doses e tomar com comida reduz o formigamento e melhora o aproveitamento.",
    evitar: "Tomar a dose total de uma vez só.",
    porqueEvitar: "Doses grandes de uma vez aumentam bastante o formigamento na pele (parestesia), que é inofensivo mas incômodo.",
    quemDeve: [
      "Praticantes de treinos intensos e de alto volume.",
      "Atletas de modalidades com esforços de 1 a 4 minutos.",
    ],
    quemNaoDeve: [
      "Gestantes e lactantes (faltam estudos de segurança).",
      "Quem se incomoda muito com o formigamento (pode usar versões de liberação lenta).",
      "Pessoas com doenças crônicas, somente com orientação profissional.",
    ],
    dose: "3,2–6,4 g por dia, divididos em doses de 0,8–1,6 g, por pelo menos 4 semanas.",
    mitos: [
      ["“Precisa tomar antes do treino para funcionar.”", "O efeito é de acúmulo; o horário não faz diferença."],
      ["“O formigamento é perigoso.”", "É uma reação inofensiva e passageira dos nervos da pele."],
    ],
  },
  {
    id: "bcaa",
    serve: "Oferecer aminoácidos em treinos em jejum e reduzir um pouco a dor muscular tardia.",
    nome: "BCAA",
    resumo: "Aminoácidos de cadeia ramificada: leucina, isoleucina e valina.",
    evidencia: "Fraca",
    oque: "Três aminoácidos essenciais — leucina, isoleucina e valina — vendidos de forma isolada. Estão presentes naturalmente em qualquer proteína completa: carnes, ovos, laticínios e whey.",
    beneficios: [
      "Pode reduzir um pouco a dor muscular tardia.",
      "Pode ter algum papel em treinos em jejum.",
      "Para ganho de massa, os benefícios são pequenos ou nulos em quem já consome proteína suficiente.",
    ],
    melhorHorario: "Antes ou durante o treino, quando o treino é feito em jejum.",
    porqueMelhor: "É a única situação em que pode fazer alguma diferença, oferecendo aminoácidos quando não há proteína recente no organismo.",
    evitar: "Usar no lugar de uma refeição ou de uma dose de proteína completa.",
    porqueEvitar: "Para construir músculo o corpo precisa de todos os 9 aminoácidos essenciais. O BCAA sozinho não sustenta a síntese muscular; whey ou comida são mais completos e costumam ter melhor custo-benefício.",
    quemDeve: [
      "Quem treina em jejum e não quer consumir proteína completa antes.",
      "Na maioria dos casos, investir em whey ou em comida é mais eficiente.",
    ],
    quemNaoDeve: [
      "Pessoas com doença do xarope de bordo (doença metabólica rara).",
      "Quem tem doença renal ou hepática, somente com orientação médica.",
      "Gestantes e lactantes sem orientação profissional.",
    ],
    dose: "5–10 g por dose.",
    mitos: [
      ["“BCAA é essencial para ganhar massa.”", "Quem consome proteína suficiente na dieta praticamente não tem benefício extra."],
      ["“BCAA impede a perda de músculo.”", "O que protege a massa muscular é o total de proteína do dia e o treino de força."],
    ],
  },
  {
    id: "glutamina",
    serve: "Apoiar a saúde intestinal e a imunidade em períodos de treino muito intenso.",
    nome: "Glutamina",
    resumo: "Aminoácido ligado ao intestino e à imunidade.",
    evidencia: "Fraca",
    evidenciaNota: "para desempenho e ganho de massa",
    oque: "Aminoácido mais abundante do corpo, produzido pelo próprio organismo. É combustível para as células do intestino e do sistema imune.",
    beneficios: [
      "Pode ajudar a saúde intestinal em situações de estresse físico intenso.",
      "Pode dar suporte à imunidade em períodos de treino muito pesado.",
      "Para força e ganho de massa, os estudos não mostram benefício em pessoas saudáveis.",
    ],
    melhorHorario: "Após o treino ou antes de dormir.",
    porqueMelhor: "São os momentos em que a demanda do intestino e do sistema imune tende a ser maior após esforço intenso. O horário tem pouca influência no resultado.",
    evitar: "Não há horário a evitar.",
    porqueEvitar: "É bem tolerada; o ponto principal é avaliar se o investimento faz sentido para o seu objetivo.",
    quemDeve: [
      "Atletas de resistência com volume de treino muito alto.",
      "Casos específicos de saúde intestinal, com orientação de nutricionista.",
    ],
    quemNaoDeve: [
      "Pessoas com doença hepática ou renal.",
      "Gestantes e lactantes (faltam estudos de segurança).",
      "Quem busca apenas hipertrofia: o benefício não se confirma.",
    ],
    dose: "5–10 g por dia.",
    mitos: [
      ["“Glutamina aumenta massa muscular.”", "Os estudos em pessoas saudáveis não confirmam esse efeito."],
    ],
  },
  {
    id: "omega-3",
    serve: "Reduzir triglicerídeos, proteger coração e cérebro e ajudar na recuperação e nas articulações.",
    nome: "Ômega-3",
    resumo: "Gorduras boas (EPA e DHA) para coração, cérebro e articulações.",
    evidencia: "Moderada",
    evidenciaNota: "forte para triglicerídeos",
    oque: "Gorduras essenciais — principalmente EPA e DHA — encontradas em peixes de água fria (salmão, sardinha, atum). O corpo não produz o suficiente, por isso precisam vir da alimentação ou de suplemento.",
    beneficios: [
      "Reduz os triglicerídeos no sangue.",
      "Apoia a saúde do coração e do cérebro.",
      "Ação anti-inflamatória que pode ajudar articulações e recuperação.",
      "Pode reduzir a dor muscular após treinos intensos.",
    ],
    melhorHorario: "Junto a uma refeição que contenha gordura (almoço ou jantar).",
    porqueMelhor: "A gordura da refeição melhora a absorção do EPA e DHA e reduz o refluxo com gosto de peixe.",
    evitar: "Em jejum.",
    porqueEvitar: "Em jejum a absorção é menor e é mais comum ter arrotos, refluxo e desconforto no estômago.",
    quemDeve: [
      "Quem come peixe menos de 2 vezes por semana.",
      "Pessoas com triglicerídeos altos, com acompanhamento médico.",
      "Praticantes de treinos intensos, para apoiar a recuperação.",
    ],
    quemNaoDeve: [
      "Quem usa anticoagulantes ou antiagregantes (ex.: varfarina, AAS) sem orientação médica — aumenta o risco de sangramento.",
      "Pessoas com alergia a peixe ou frutos do mar (existe ômega-3 de algas).",
      "Quem vai passar por cirurgia: suspender conforme orientação médica.",
    ],
    dose: "1–3 g de EPA + DHA por dia. Atenção ao rótulo: a quantidade de EPA + DHA é menor do que o peso da cápsula (ex.: cápsula de 1 g pode ter só 300 mg de EPA + DHA).",
    mitos: [
      ["“Toda cápsula de 1 g tem 1 g de ômega-3.”", "O que importa é o total de EPA + DHA descrito no rótulo."],
      ["“Ômega-3 emagrece.”", "Não há efeito relevante na perda de gordura."],
    ],
  },
  {
    id: "vitamina-d",
    serve: "Corrigir a deficiência, fortalecer ossos e músculos e apoiar a imunidade.",
    nome: "Vitamina D",
    resumo: "Vitamina essencial para ossos, músculos e imunidade.",
    evidencia: "Forte",
    evidenciaNota: "para corrigir deficiência",
    oque: "Vitamina produzida principalmente pela pele com a exposição ao sol, e encontrada em poucos alimentos. Funciona como um hormônio, atuando em ossos, músculos e sistema imune. A deficiência é muito comum, mesmo em países ensolarados.",
    beneficios: [
      "Mantém ossos fortes (ajuda a absorver cálcio).",
      "Contribui para a força e a função muscular.",
      "Apoia o sistema imune.",
      "Em quem tem deficiência, a correção pode melhorar força e disposição.",
    ],
    melhorHorario: "De manhã ou no almoço, junto a uma refeição com gordura.",
    porqueMelhor: "A vitamina D se dissolve em gordura; com a refeição a absorção é bem maior.",
    evitar: "Em jejum ou com refeições sem gordura.",
    porqueEvitar: "A absorção cai bastante sem gordura na refeição.",
    quemDeve: [
      "Quem tem deficiência confirmada em exame de sangue.",
      "Pessoas com pouca exposição ao sol, idosos e pessoas de pele mais escura.",
    ],
    quemNaoDeve: [
      "Quem tem cálcio alto no sangue (hipercalcemia).",
      "Pessoas com sarcoidose ou histórico de cálculo renal de cálcio, sem orientação médica.",
      "Ninguém deveria usar doses altas sem exame — o excesso acumula e pode ser tóxico.",
    ],
    dose: "Definida por exame de sangue. Manutenção comum: 1.000–2.000 UI por dia. Doses maiores somente com prescrição.",
    mitos: [
      ["“Quanto mais, melhor.”", "O excesso acumula no corpo e pode elevar o cálcio no sangue, trazendo riscos aos rins e ao coração."],
      ["“Tomando sol não preciso me preocupar.”", "Horário, protetor solar, tom de pele e idade influenciam muito; só o exame confirma."],
    ],
  },
  {
    id: "magnesio",
    serve: "Ajudar no relaxamento muscular, na qualidade do sono, na produção de energia e a prevenir câimbras.",
    nome: "Magnésio",
    resumo: "Mineral para músculos, nervos, energia e sono.",
    evidencia: "Moderada",
    evidenciaNota: "principalmente em quem tem deficiência",
    oque: "Mineral que participa de mais de 300 reações no corpo, incluindo contração muscular, produção de energia e funcionamento do sistema nervoso. Está presente em castanhas, sementes, folhas verdes escuras e grãos integrais. As formas mais bem absorvidas são glicinato (bisglicinato), citrato e malato.",
    beneficios: [
      "Contribui para o funcionamento normal dos músculos.",
      "Pode ajudar a relaxar e a melhorar a qualidade do sono.",
      "Participa da produção de energia.",
      "Pode ajudar em quem tem câimbras ligadas à deficiência.",
    ],
    melhorHorario: "À noite, de 30 a 60 minutos antes de dormir.",
    porqueMelhor: "O magnésio tem ação relaxante no sistema nervoso e nos músculos. A forma glicinato é a mais indicada para a noite.",
    evitar: "Junto com suplementos de cálcio, ferro ou zinco em dose alta e perto de alguns antibióticos.",
    porqueEvitar: "Esses minerais competem pela absorção. Com antibióticos (quinolonas, tetraciclinas) e remédios para tireoide, o magnésio reduz o efeito do remédio — manter pelo menos 2 horas de intervalo.",
    quemDeve: [
      "Quem consome pouca castanha, semente, folha verde e grão integral.",
      "Pessoas com sono ruim ou câimbras frequentes (investigar a causa).",
      "Atletas que suam muito.",
    ],
    quemNaoDeve: [
      "Pessoas com insuficiência renal (o magnésio pode se acumular).",
      "Quem tem intestino sensível: formas como óxido e citrato podem soltar o intestino.",
      "Quem usa medicamentos que interagem, sem orientação médica.",
    ],
    dose: "200–400 mg de magnésio elementar por dia (confira no rótulo a quantidade de magnésio, não o peso do composto).",
    mitos: [
      ["“Todo magnésio é igual.”", "O óxido é barato mas pouco absorvido e mais laxativo; glicinato, citrato e malato são melhor aproveitados."],
    ],
  },
  {
    id: "multivitaminico",
    serve: "Cobrir falhas de vitaminas e minerais em dietas restritas ou pouco variadas.",
    nome: "Multivitamínico",
    resumo: "Combinação de vitaminas e minerais em uma dose.",
    evidencia: "Fraca",
    evidenciaNota: "para quem já tem dieta equilibrada",
    oque: "Suplemento que reúne várias vitaminas e minerais em doses próximas às recomendações diárias. Funciona como uma “segurança” para cobrir pequenas falhas da alimentação.",
    beneficios: [
      "Ajuda a prevenir deficiências em dietas restritivas ou pouco variadas.",
      "Útil para vegetarianos, veganos, idosos e em dietas de baixa caloria.",
      "Para quem já come bem e de forma variada, o benefício é pequeno.",
    ],
    melhorHorario: "Com o café da manhã ou o almoço.",
    porqueMelhor: "As vitaminas A, D, E e K precisam de gordura da refeição para serem absorvidas, e com comida há menos enjoo.",
    evitar: "Em jejum, junto com café e no mesmo horário de suplemento de cálcio.",
    porqueEvitar: "Em jejum pode causar enjoo. O café e o cálcio reduzem a absorção do ferro e de outros minerais.",
    quemDeve: [
      "Pessoas com alimentação pouco variada ou em dieta de restrição calórica.",
      "Vegetarianos, veganos e idosos.",
    ],
    quemNaoDeve: [
      "Quem já toma vitaminas isoladas em dose alta (risco de somar e passar do limite, principalmente vitamina A e ferro).",
      "Pessoas com excesso de ferro no organismo (hemocromatose): preferir versões sem ferro.",
      "Fumantes: evitar fórmulas com betacaroteno em dose alta.",
      "Gestantes devem usar polivitamínico específico para gestação, prescrito.",
    ],
    dose: "1 dose por dia, conforme o rótulo. Prefira fórmulas com doses próximas a 100% da recomendação diária, não megadoses.",
    mitos: [
      ["“Multivitamínico dá energia.”", "Só faz diferença perceptível se houver deficiência."],
      ["“Substitui frutas e verduras.”", "Os alimentos têm fibras e compostos que nenhuma cápsula reproduz."],
    ],
  },
  {
    id: "colageno",
    serve: "Fortalecer tendões e articulações e melhorar a elasticidade e hidratação da pele.",
    nome: "Colágeno",
    resumo: "Proteína de pele, tendões, ligamentos e articulações.",
    evidencia: "Moderada",
    evidenciaNota: "pele; evidência inicial para articulações",
    oque: "Principal proteína estrutural do corpo, presente na pele, tendões, ligamentos, ossos e cartilagens. No suplemento vem na forma de colágeno hidrolisado (peptídeos de colágeno), mais fácil de absorver.",
    beneficios: [
      "Pode melhorar a hidratação e a elasticidade da pele.",
      "Pode reduzir dores articulares em quem pratica esporte.",
      "Pode apoiar a recuperação de tendões e ligamentos, junto com o treino.",
    ],
    melhorHorario: "Para tendões e articulações: 30–60 minutos antes do treino, com vitamina C. Para pele: qualquer horário.",
    porqueMelhor: "O treino aumenta a chegada de sangue e nutrientes aos tendões; ter os aminoácidos do colágeno disponíveis nesse momento favorece o aproveitamento. A vitamina C é necessária para o corpo produzir colágeno.",
    evitar: "Contar o colágeno como parte da proteína para ganhar massa.",
    porqueEvitar: "É uma proteína incompleta (não tem triptofano e tem pouca leucina), por isso é fraca para construir músculo.",
    quemDeve: [
      "Quem tem dores articulares ou sobrecarga em tendões, junto ao tratamento.",
      "Pessoas que buscam benefícios para a pele.",
      "Atletas com treinos de alto impacto.",
    ],
    quemNaoDeve: [
      "Pessoas com alergia à fonte do colágeno (peixe, frutos do mar ou bovino) — verificar o rótulo.",
      "Quem tem doença renal, sem orientação médica.",
    ],
    dose: "Pele: 2,5–10 g por dia. Tendões e articulações: 10–15 g por dia, com cerca de 50 mg de vitamina C.",
    mitos: [
      ["“Colágeno ajuda a ganhar massa muscular.”", "É uma proteína de baixa qualidade para músculo; whey e alimentos são muito melhores."],
      ["“Vai direto para a pele.”", "O corpo quebra o colágeno em aminoácidos e peptídeos e decide onde usar."],
    ],
  },
  {
    id: "hipercalorico",
    serve: "Facilitar o aumento de calorias para quem tem dificuldade de ganhar peso e massa.",
    nome: "Hipercalórico",
    resumo: "Mistura de carboidratos e proteína para ganho de peso.",
    evidencia: "Moderada",
    evidenciaNota: "funciona se somar calorias à dieta",
    oque: "Suplemento com muitas calorias por dose, geralmente de 400 a mais de 1.000 kcal, combinando carboidratos (maltodextrina, dextrose, aveia) e proteína. É, na prática, uma refeição líquida.",
    beneficios: [
      "Facilita atingir um superávit calórico para ganhar peso.",
      "Prático para quem tem pouco apetite ou dificuldade de comer grandes volumes.",
      "Ajuda a repor energia após treinos longos.",
    ],
    melhorHorario: "Entre as refeições (lanches) ou no pós-treino.",
    porqueMelhor: "Assim ele soma calorias sem tirar o apetite das refeições principais.",
    evitar: "Logo antes das refeições principais e antes de dormir, se causar desconforto.",
    porqueEvitar: "Por ser muito calórico, tira a fome da refeição seguinte, e o total de calorias do dia não aumenta. À noite, o volume grande pode causar má digestão.",
    quemDeve: [
      "Pessoas magras com dificuldade real de ganhar peso (ectomorfos).",
      "Atletas com gasto calórico muito alto.",
    ],
    quemNaoDeve: [
      "Quem quer perder gordura ou já está acima do peso.",
      "Pessoas com diabetes ou resistência à insulina (muito açúcar de absorção rápida).",
      "Intolerantes à lactose, conforme a fórmula.",
    ],
    dose: "Conforme o rótulo e a necessidade calórica — muitas vezes meia dose já é suficiente. Uma alternativa caseira é bater whey com aveia, banana e pasta de amendoim.",
    mitos: [
      ["“Hipercalórico dá massa muscular.”", "Ele dá calorias. O que transforma calorias em músculo é o treino de força com proteína suficiente; sem treino, vira gordura."],
    ],
  },
  {
    id: "termogenico",
    serve: "Aumentar levemente o gasto calórico e a disposição, como apoio ao emagrecimento com dieta e treino.",
    nome: "Termogênico",
    resumo: "Estimulantes que prometem acelerar o metabolismo.",
    evidencia: "Fraca",
    evidenciaNota: "efeito pequeno",
    restricao: true,
    oque: "Produto que combina estimulantes e compostos como cafeína, chá verde, pimenta (capsaicina), gengibre e, em alguns casos, sinefrina. Aumenta um pouco o gasto calórico e a disposição.",
    beneficios: [
      "Leve aumento do gasto calórico, em geral de 50 a 100 kcal por dia.",
      "Mais disposição e redução do apetite em algumas pessoas.",
      "Sozinho não emagrece: só ajuda quando existe déficit calórico com dieta e treino.",
    ],
    melhorHorario: "De manhã ou até cerca de 30 minutos antes do treino, se for antes das 16h.",
    porqueMelhor: "É quando a disposição extra ajuda na rotina e no treino, sem atrapalhar o sono.",
    evitar: "Depois do meio da tarde e em jejum, se causar desconforto.",
    porqueEvitar: "Os estimulantes prejudicam o sono, e dormir mal aumenta a fome e dificulta o emagrecimento. Em jejum podem causar enjoo, tremores e taquicardia.",
    quemDeve: [
      "Adultos saudáveis, já em dieta e treino, que toleram bem estimulantes — apenas como complemento.",
    ],
    quemNaoDeve: [
      "Hipertensos (pressão alta).",
      "Pessoas com doenças cardíacas ou arritmia.",
      "Quem tem hipertireoidismo.",
      "Gestantes e lactantes.",
      "Quem tem ansiedade, síndrome do pânico ou insônia.",
      "Menores de 18 anos.",
      "Quem usa antidepressivos ou outros medicamentos que interagem com estimulantes.",
      "Quem já usa pré-treino ou toma muito café (a cafeína se soma).",
    ],
    dose: "Seguir o rótulo, começando com meia dose. Verifique o total de cafeína e evite a combinação de sinefrina com doses altas de cafeína.",
    mitos: [
      ["“Termogênico queima gordura sozinho.”", "O efeito é pequeno; sem déficit calórico não há perda de gordura."],
      ["“Suar mais significa queimar mais gordura.”", "O suor é perda de água, não de gordura."],
    ],
  },
];
