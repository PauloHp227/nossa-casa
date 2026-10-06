"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

/* ================================================= */
/* TIPOS */
/* ================================================= */

type Pessoa = {
id: string;
nome: string;
};

type Aporte = {
id: string;
pessoa_id: string;
valor: number;
data: string;
observacao: string | null;
};

type ItemCasa = {
id: string;
nome: string;
categoria: string | null;
tema: string | null;
quantidade: number | null;
valor_estimado: number | null;
valor_pago: number | null;
comprado: boolean | null;
loja: string | null;
observacao: string | null;
created_at?: string;
preco_estimado?: number | null;
preco_pago?: number | null;
imagem_url?: string | null;
};

type PlanejamentoMensal = {
id: string;
mes: number;
ano: number;
meta: number;
created_at?: string;
};

type EventoAgenda = {
id: string;
titulo: string;
data: string;
horario: string | null;
categoria: string | null;
descricao: string | null;
recorrencia: string | null;
concluido: boolean | null;
emoji: string | null;
created_at?: string;
};

type FinanceiroLancamento = {
id: string;
pessoa: string;
tipo: "salario" | "ganho_adicional" | "gasto";
descricao: string;
valor: number;
data: string;
categoria: string | null;
created_at?: string;
};

type FinanceiroCategoria = {
id: string;
pessoa: string;
nome: string;
emoji: string;
created_at?: string;
};

type DividaFinanceira = {
id: string;
pessoa: string;
nome: string;
valor_total: number;
parcelas_total: number;
valor_parcela: number;
data_primeira: string;
categoria: string | null;
status: string;
created_at?: string;
};

type ParcelaFinanceira = {
id: string;
divida_id: string;
numero: number;
valor: number;
vencimento: string;
paga: boolean;
data_pagamento: string | null;
};

type Notificacao = {
id: string;
titulo: string;
mensagem: string;
tipo: string | null;
lida: boolean | null;
created_at?: string;
};

type Aba =
| "visao-geral"
| "financas"
| "aportes"
| "planejamento"
| "itens"
| "enxoval"
| "agenda";

/* ================================================= */
/* TEMAS DO ENXOVAL */
/* ================================================= */

const TEMAS_ENXOVAL = [
  "Cozinha",
  "Mesa",
  "Quarto",
  "Banheiro",
  "Limpeza",
  "Sala",
  "Decoração",
  "Outros",
];

const EMOJIS_TEMAS_ENXOVAL: Record<string, string> = {
  Cozinha: "🍳",
  Mesa: "🍽️",
  Quarto: "🛏️",
  Banheiro: "🛁",
  Limpeza: "🧹",
  Sala: "🛋️",
  Decoração: "🪴",
  Outros: "📦",
};

const formatarTemaEnxoval = (tema: string) =>
  `${EMOJIS_TEMAS_ENXOVAL[tema] || "📦"} ${tema}`;


const CATEGORIAS_FINANCEIRAS_PADRAO = [
  { nome: "Casa", emoji: "🏠" },
  { nome: "Conta de luz", emoji: "💡" },
  { nome: "Conta de água", emoji: "💧" },
  { nome: "Gás", emoji: "🔥" },
  { nome: "Internet", emoji: "📶" },
  { nome: "Telefone", emoji: "📱" },
  { nome: "Aluguel", emoji: "🏡" },
  { nome: "Alimentação", emoji: "🍔" },
  { nome: "Mercado", emoji: "🛒" },
  { nome: "Transporte", emoji: "🚗" },
  { nome: "Combustível", emoji: "⛽" },
  { nome: "Cartão", emoji: "💳" },
  { nome: "Lazer", emoji: "🎮" },
  { nome: "Estudos", emoji: "📚" },
  { nome: "Viagem", emoji: "✈️" },
  { nome: "Saúde", emoji: "❤️" },
  { nome: "Assinaturas", emoji: "📺" },
  { nome: "Presentes", emoji: "🎁" },
  { nome: "Reserva de emergência", emoji: "🏦" },
  { nome: "Dinheiro para guardar", emoji: "💰" },
  { nome: "Objetivo", emoji: "🎯" },
  { nome: "Casa nova", emoji: "🏠" },
  { nome: "Carro", emoji: "🚗" },
  { nome: "Casamento", emoji: "💍" },
  { nome: "Investimentos", emoji: "📈" },
  { nome: "Salário", emoji: "💼" },
  { nome: "Freelance", emoji: "💻" },
  { nome: "Hora extra", emoji: "⏰" },
  { nome: "Renda extra", emoji: "🧑‍💻" },
  { nome: "Comissão", emoji: "💸" },
  { nome: "Venda", emoji: "📦" },
  { nome: "Reembolso", emoji: "↩️" },
  { nome: "Outras receitas", emoji: "➕" },
  { nome: "Outros", emoji: "📦" },
];

const EMOJIS_FINANCEIROS = [
  "🏠","🍔","🚗","💳","🎮","📚","✈️","❤️",
  "🛒","📱","💡","💰","🎁","☕","🐶","📦",
];


/* ================================================= */
/* COMPONENTE PRINCIPAL */
/* ================================================= */

export default function Home() {
const [abaAtiva, setAbaAtiva] =
useState<Aba>("visao-geral");

const [total, setTotal] = useState(0);
const [meta, setMeta] = useState(9000);
const [carregando, setCarregando] =
useState(true);
const [erro, setErro] = useState("");

const [pessoas, setPessoas] =
useState<Pessoa[]>([]);

const [aportes, setAportes] =
useState<Aporte[]>([]);

const [itensCasa, setItensCasa] =
useState<ItemCasa[]>([]);

const [
planejamentos,
setPlanejamentos,
] = useState<PlanejamentoMensal[]>([]);

/* NOSSA AGENDA */

const [eventosAgenda, setEventosAgenda] =
useState<EventoAgenda[]>([]);

const [notificacoes, setNotificacoes] =
useState<Notificacao[]>([]);

const [notificacoesAbertas, setNotificacoesAbertas] =
useState(false);


const [modalAgenda, setModalAgenda] =
useState(false);

const [eventoEditando, setEventoEditando] =
useState<EventoAgenda | null>(null);

const [tituloEvento, setTituloEvento] =
useState("");

const [dataEvento, setDataEvento] =
useState(
new Date().toISOString().split("T")[0]
);

const [horarioEvento, setHorarioEvento] =
useState("");

const [categoriaEvento, setCategoriaEvento] =
useState("Fazer juntos");

const [emojiEvento, setEmojiEvento] =
useState("💑");

const [descricaoEvento, setDescricaoEvento] =
useState("");

const [recorrenciaEvento, setRecorrenciaEvento] =
useState("nenhuma");

const [salvandoEvento, setSalvandoEvento] =
useState(false);

const [mesAgenda, setMesAgenda] =
useState(new Date().getMonth());

const [anoAgenda, setAnoAgenda] =
useState(new Date().getFullYear());

/* NOVO APORTE */

const [
modalAporteAberto,
setModalAporteAberto,
] = useState(false);

const [
pessoaSelecionada,
setPessoaSelecionada,
] = useState("");

const [valor, setValor] =
useState("");

const [data, setData] =
useState(
new Date()
.toISOString()
.split("T")[0]
);

const [observacao, setObservacao] =
useState("");

const [
salvandoAporte,
setSalvandoAporte,
] = useState(false);

/* EDITAR APORTE */

const [
aporteEditando,
setAporteEditando,
] = useState<Aporte | null>(null);

const [
valorEdicao,
setValorEdicao,
] = useState("");

const [
dataEdicao,
setDataEdicao,
] = useState("");

const [
observacaoEdicao,
setObservacaoEdicao,
] = useState("");

const [
salvandoEdicaoAporte,
setSalvandoEdicaoAporte,
] = useState(false);

/* EXCLUIR APORTE */

const [
aporteParaExcluir,
setAporteParaExcluir,
] = useState<Aporte | null>(null);

const [
excluindoAporte,
setExcluindoAporte,
] = useState(false);

/* META PRINCIPAL */

const [
modalMetaPrincipal,
setModalMetaPrincipal,
] = useState(false);

const [
metaPrincipalEditando,
setMetaPrincipalEditando,
] = useState("");

const [
salvandoMetaPrincipal,
setSalvandoMetaPrincipal,
] = useState(false);

/* PLANEJAMENTO */

const [
modalPlanejamento,
setModalPlanejamento,
] = useState(false);

const [
planejamentoEditando,
setPlanejamentoEditando,
] = useState<PlanejamentoMensal | null>(null);

const [
mesPlanejamento,
setMesPlanejamento,
] = useState(
new Date().getMonth() + 1
);

const [
anoPlanejamento,
setAnoPlanejamento,
] = useState(
new Date().getFullYear()
);

const [
valorMetaMensal,
setValorMetaMensal,
] = useState("500");

const [
salvandoPlanejamento,
setSalvandoPlanejamento,
] = useState(false);

/* ITEM NOVO */

const [modalItem, setModalItem] =
useState(false);

const [
tipoNovoItem,
setTipoNovoItem,
] = useState<"Casa" | "Enxoval">(
"Casa"
);

const [nomeItem, setNomeItem] =
useState("");

const [temaItem, setTemaItem] =
useState("");

const [valorItem, setValorItem] =
useState("");

const [
quantidadeItem,
setQuantidadeItem,
] = useState("1");

const [lojaItem, setLojaItem] =
useState("");

const [
observacaoItem,
setObservacaoItem,
] = useState("");

const [imagemItem, setImagemItem] = useState("");
const [uploadandoImagemItem, setUploadandoImagemItem] = useState(false);

const [
salvandoItem,
setSalvandoItem,
] = useState(false);

/* EDITAR ITEM */

const [
itemEditando,
setItemEditando,
] = useState<ItemCasa | null>(null);

const [
nomeItemEdicao,
setNomeItemEdicao,
] = useState("");

const [
temaItemEdicao,
setTemaItemEdicao,
] = useState("");

const [
valorItemEdicao,
setValorItemEdicao,
] = useState("");

const [
quantidadeItemEdicao,
setQuantidadeItemEdicao,
] = useState("1");

const [
lojaItemEdicao,
setLojaItemEdicao,
] = useState("");

const [
observacaoItemEdicao,
setObservacaoItemEdicao,
] = useState("");

const [imagemItemEdicao, setImagemItemEdicao] = useState("");
const [uploadandoImagemItemEdicao, setUploadandoImagemItemEdicao] = useState(false);

const [
compradoItemEdicao,
setCompradoItemEdicao,
] = useState(false);

const [
salvandoEdicaoItem,
setSalvandoEdicaoItem,
] = useState(false);

const [temaEnxovalSelecionado, setTemaEnxovalSelecionado] = useState<string | null>(null);


/* FINANÇAS */
const [abaFinancas, setAbaFinancas] = useState<"casal" | "julia" | "paulo">("casal");
const [lancamentosFinanceiros, setLancamentosFinanceiros] = useState<FinanceiroLancamento[]>([]);
const [categoriasFinanceiras, setCategoriasFinanceiras] = useState<FinanceiroCategoria[]>([]);
const [dividasFinanceiras, setDividasFinanceiras] = useState<DividaFinanceira[]>([]);
const [parcelasFinanceiras, setParcelasFinanceiras] = useState<ParcelaFinanceira[]>([]);
const [mesFinanceiro, setMesFinanceiro] = useState(new Date().getMonth());
const [anoFinanceiro, setAnoFinanceiro] = useState(new Date().getFullYear());

const [modalFinanceiro, setModalFinanceiro] = useState<"salario" | "ganho_adicional" | "gasto" | "divida" | "categoria" | null>(null);
const [lancamentoEditando, setLancamentoEditando] = useState<FinanceiroLancamento | null>(null);
const [dividaEditando, setDividaEditando] = useState<DividaFinanceira | null>(null);
const [categoriaEditando, setCategoriaEditando] = useState<FinanceiroCategoria | null>(null);
const [descricaoFinanceira, setDescricaoFinanceira] = useState("");
const [valorFinanceiro, setValorFinanceiro] = useState("");
const [dataFinanceira, setDataFinanceira] = useState(new Date().toISOString().split("T")[0]);
const [categoriaFinanceira, setCategoriaFinanceira] = useState("");
const [nomeCategoriaFinanceira, setNomeCategoriaFinanceira] = useState("");
const [emojiCategoriaFinanceira, setEmojiCategoriaFinanceira] = useState("📦");
const [nomeDividaFinanceira, setNomeDividaFinanceira] = useState("");
const [valorTotalDivida, setValorTotalDivida] = useState("");
const [parcelasDivida, setParcelasDivida] = useState("1");
const [valorParcelaDivida, setValorParcelaDivida] = useState("");
const [dataPrimeiraDivida, setDataPrimeiraDivida] = useState(new Date().toISOString().split("T")[0]);
const [categoriaDivida, setCategoriaDivida] = useState("");
const [salvandoFinanceiro, setSalvandoFinanceiro] = useState(false);
const [parcelaEditando, setParcelaEditando] = useState<ParcelaFinanceira | null>(null);
const [valorParcelaEdicao, setValorParcelaEdicao] = useState("");
const [lancamentosFinanceirosAbertos, setLancamentosFinanceirosAbertos] = useState(false);
const [categoriasFinanceirasAbertas, setCategoriasFinanceirasAbertas] = useState(false);
const [modoValorDivida, setModoValorDivida] = useState<"total" | "mensal">("total");

/* EXCLUIR ITEM */

const [
itemParaExcluir,
setItemParaExcluir,
] = useState<ItemCasa | null>(null);

const [
excluindoItem,
setExcluindoItem,
] = useState(false);

/* ================================================= */
/* INICIAR */
/* ================================================= */

useEffect(() => {
  buscarDados();

  const canal = supabase
    .channel("plano-juntos-notificacoes")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "notificacoes" },
      (payload) => {
        const nova = payload.new as Notificacao;

        setNotificacoes((atuais) => {
          if (atuais.some((item) => item.id === nova.id)) return atuais;
          return [nova, ...atuais].slice(0, 30);
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(canal);
  };
}, []);

/* ================================================= */
/* FORMATAR MOEDA */
/* ================================================= */

function formatarMoeda(valor: number) {
return Number(valor || 0).toLocaleString(
"pt-BR",
{
style: "currency",
currency: "BRL",
}
);
}

/* ================================================= */
/* NOME DO MÊS */
/* ================================================= */

function nomeDoMes(mes: number) {
const meses = [
"Janeiro",
"Fevereiro",
"Março",
"Abril",
"Maio",
"Junho",
"Julho",
"Agosto",
"Setembro",
"Outubro",
"Novembro",
"Dezembro",
];

return meses[mes - 1];

}

/* ================================================= */
/* NOTIFICAÇÕES */
/* ================================================= */

async function registrarNotificacao(
titulo: string,
mensagem: string,
tipo = "info"
) {
  const { data: novaNotificacao, error } = await supabase
    .from("notificacoes")
    .insert({
      titulo,
      mensagem,
      tipo,
      lida: false,
    })
    .select("*")
    .single();

  if (!error && novaNotificacao) {
    setNotificacoes((atual) => [
      novaNotificacao,
      ...atual,
    ].slice(0, 30));
  }
}

/* ================================================= */
/* BUSCAR DADOS */
/* ================================================= */

async function buscarDados() {
setCarregando(true);
setErro("");

try {
  const [
    respostaAportes,
    respostaPessoas,
    respostaItens,
    respostaConfiguracao,
    respostaPlanejamento,
    respostaAgenda,
    respostaNotificacoes,
    respostaLancamentosFinanceiros,
    respostaCategoriasFinanceiras,
    respostaDividasFinanceiras,
    respostaParcelasFinanceiras,
  ] = await Promise.all([
    supabase
      .from("aportes")
      .select(
        "id, pessoa_id, valor, data, observacao"
      )
      .order("data", {
        ascending: false,
      }),

    supabase
      .from("pessoas")
      .select("id, nome"),

    supabase
      .from("itens_casa")
      .select("*")
      .order("created_at", {
        ascending: false,
      }),

    supabase
      .from("configuracoes")
      .select("*")
      .limit(1),

    supabase
      .from("planejamento_mensal")
      .select(
        "id, mes, ano, meta, created_at"
      )
      .order("ano", {
        ascending: false,
      })
      .order("mes", {
        ascending: false,
      }),

    supabase
      .from("agenda_eventos")
      .select("*")
      .order("data", {
        ascending: true,
      })
      .order("horario", {
        ascending: true,
        nullsFirst: false,
      }),

    supabase
      .from("notificacoes")
      .select("*")
      .order("created_at", {
        ascending: false,
      })
      .limit(30),

    supabase
      .from("financas_lancamentos")
      .select("*")
      .order("data", { ascending: false }),

    supabase
      .from("financas_categorias")
      .select("*")
      .order("nome", { ascending: true }),

    supabase
      .from("financas_dividas")
      .select("*")
      .order("data_primeira", { ascending: true }),

    supabase
      .from("financas_parcelas")
      .select("*")
      .order("vencimento", { ascending: true }),
  ]);

  if (respostaAportes.error) {
    throw respostaAportes.error;
  }

  if (respostaPessoas.error) {
    throw respostaPessoas.error;
  }

  if (respostaItens.error) {
    throw respostaItens.error;
  }

  if (respostaConfiguracao.error) {
    throw respostaConfiguracao.error;
  }

  if (respostaPlanejamento.error) {
    throw respostaPlanejamento.error;
  }

  // As tabelas novas são opcionais durante a primeira publicação.
  // Se ainda não existirem no Supabase, o restante do sistema continua funcionando.
  if (!respostaAgenda.error) {
    setEventosAgenda(respostaAgenda.data || []);
  }

  if (!respostaNotificacoes.error) {
    setNotificacoes(respostaNotificacoes.data || []);
  }

  if (!respostaLancamentosFinanceiros.error) {
    setLancamentosFinanceiros(respostaLancamentosFinanceiros.data || []);
  }

  if (!respostaCategoriasFinanceiras.error) {
    const categoriasExistentes = respostaCategoriasFinanceiras.data || [];
    const novasCategorias: Array<{ pessoa: string; nome: string; emoji: string }> = [];

    for (const pessoa of ["casal", "julia", "paulo"]) {
      for (const categoria of CATEGORIAS_FINANCEIRAS_PADRAO) {
        const existe = categoriasExistentes.some(
          (item) => item.pessoa === pessoa && item.nome.toLowerCase() === categoria.nome.toLowerCase()
        );
        if (!existe) {
          novasCategorias.push({ pessoa, ...categoria });
        }
      }
    }

    let categoriasCompletas = categoriasExistentes;
    if (novasCategorias.length > 0) {
      const respostaNovasCategorias = await supabase
        .from("financas_categorias")
        .insert(novasCategorias)
        .select("*");

      if (!respostaNovasCategorias.error) {
        categoriasCompletas = [...categoriasExistentes, ...(respostaNovasCategorias.data || [])];
      }
    }

    // Mantém somente uma categoria por pessoa + nome, mesmo se o banco já tiver duplicatas.
    const categoriasUnicas = new Map<string, FinanceiroCategoria>();
    for (const categoria of categoriasCompletas) {
      const chave = `${categoria.pessoa}:${categoria.nome.trim().toLowerCase()}`;
      if (!categoriasUnicas.has(chave)) categoriasUnicas.set(chave, categoria as FinanceiroCategoria);
    }
    setCategoriasFinanceiras(Array.from(categoriasUnicas.values()));
  }

  if (!respostaDividasFinanceiras.error) {
    setDividasFinanceiras(respostaDividasFinanceiras.data || []);
  }

  if (!respostaParcelasFinanceiras.error) {
    setParcelasFinanceiras(respostaParcelasFinanceiras.data || []);
  }

  const listaAportes =
    respostaAportes.data || [];

  const soma =
    listaAportes.reduce(
      (acumulado, aporte) =>
        acumulado +
        Number(aporte.valor || 0),
      0
    );

  setAportes(listaAportes);
  setPessoas(respostaPessoas.data || []);
  setItensCasa(respostaItens.data || []);

  setPlanejamentos(
    respostaPlanejamento.data || []
  );

  setTotal(soma);

  const configuracao =
    respostaConfiguracao.data?.[0];

  if (configuracao?.meta_total) {
    setMeta(
      Number(configuracao.meta_total)
    );
  }
} catch (error: any) {
  setErro(
    error?.message ||
      "Erro ao buscar os dados."
  );
} finally {
  setCarregando(false);
}

}

/* ================================================= */
/* ADICIONAR APORTE */
/* ================================================= */

async function adicionarAporte(
evento: FormEvent
) {
evento.preventDefault();

setErro("");

if (!pessoaSelecionada) {
  setErro("Selecione uma pessoa.");
  return;
}

if (
  !valor ||
  Number(valor) <= 0
) {
  setErro(
    "Digite um valor válido."
  );
  return;
}

setSalvandoAporte(true);

const { error } = await supabase
  .from("aportes")
  .insert({
    pessoa_id: pessoaSelecionada,
    valor: Number(valor),
    data,
    observacao:
      observacao || null,
  });

if (error) {
  setErro(error.message);
  setSalvandoAporte(false);
  return;
}

const valorNotificacaoAporte = Number(valor);

setPessoaSelecionada("");
setValor("");
setObservacao("");

setModalAporteAberto(false);
setSalvandoAporte(false);

await registrarNotificacao(
  "Novo aporte registrado",
  `Um novo aporte de ${formatarMoeda(valorNotificacaoAporte)} foi adicionado.`,
  "financeiro"
);

await buscarDados();

}

/* ================================================= */
/* EDITAR APORTE */
/* ================================================= */

function abrirEdicaoAporte(
aporte: Aporte
) {
setErro("");

setAporteEditando(aporte);

setValorEdicao(
  String(aporte.valor)
);

setDataEdicao(aporte.data);

setObservacaoEdicao(
  aporte.observacao || ""
);

}

async function salvarEdicaoAporte(
evento: FormEvent
) {
evento.preventDefault();

if (!aporteEditando) {
  return;
}

if (
  !valorEdicao ||
  Number(valorEdicao) <= 0
) {
  setErro(
    "Digite um valor válido."
  );
  return;
}

setSalvandoEdicaoAporte(true);

const { error } = await supabase
  .from("aportes")
  .update({
    valor:
      Number(valorEdicao),
    data: dataEdicao,
    observacao:
      observacaoEdicao || null,
  })
  .eq(
    "id",
    aporteEditando.id
  );

if (error) {
  setErro(error.message);

  setSalvandoEdicaoAporte(false);

  return;
}

const valorNotificacao = Number(valorEdicao);
setAporteEditando(null);

setSalvandoEdicaoAporte(false);

await registrarNotificacao(
  "Aporte atualizado",
  `Um aporte foi atualizado para ${formatarMoeda(valorNotificacao)}.`,
  "financeiro"
);

await buscarDados();

}

/* ================================================= */
/* EXCLUIR APORTE */
/* ================================================= */

async function excluirAporte() {
if (!aporteParaExcluir) {
return;
}

setExcluindoAporte(true);

const { error } = await supabase
  .from("aportes")
  .delete()
  .eq(
    "id",
    aporteParaExcluir.id
  );

if (error) {
  setErro(error.message);

  setExcluindoAporte(false);

  return;
}

setAporteParaExcluir(null);

setExcluindoAporte(false);

await registrarNotificacao(
  "Aporte removido",
  "Um aporte foi removido do planejamento financeiro.",
  "financeiro"
);

await buscarDados();

}

/* ================================================= */
/* META PRINCIPAL */
/* ================================================= */

async function salvarMetaPrincipal(
evento: FormEvent
) {
evento.preventDefault();

setErro("");

if (
  !metaPrincipalEditando ||
  Number(metaPrincipalEditando) <= 0
) {
  setErro(
    "Digite uma meta válida."
  );

  return;
}

setSalvandoMetaPrincipal(true);

const {
  data: configuracoes,
  error: erroBusca,
} = await supabase
  .from("configuracoes")
  .select("id")
  .limit(1);

if (erroBusca) {
  setErro(erroBusca.message);

  setSalvandoMetaPrincipal(false);

  return;
}

const configuracao =
  configuracoes?.[0];

if (!configuracao) {
  setErro(
    "Nenhuma configuração foi encontrada."
  );

  setSalvandoMetaPrincipal(false);

  return;
}

const { error } = await supabase
  .from("configuracoes")
  .update({
    meta_total:
      Number(
        metaPrincipalEditando
      ),
  })
  .eq(
    "id",
    configuracao.id
  );

if (error) {
  setErro(error.message);

  setSalvandoMetaPrincipal(false);

  return;
}

setMeta(
  Number(
    metaPrincipalEditando
  )
);

setModalMetaPrincipal(false);

setSalvandoMetaPrincipal(false);

await registrarNotificacao(
  "Meta principal atualizada",
  `A meta principal agora é ${formatarMoeda(Number(metaPrincipalEditando))}.`,
  "meta"
);

await buscarDados();

}

/* ================================================= */
/* PLANEJAMENTO */
/* ================================================= */

function abrirNovoPlanejamento() {
const hoje = new Date();

setPlanejamentoEditando(null);

setMesPlanejamento(
  hoje.getMonth() + 1
);

setAnoPlanejamento(
  hoje.getFullYear()
);

setValorMetaMensal("500");

setErro("");

setModalPlanejamento(true);

}

function abrirEdicaoPlanejamento(
planejamento: PlanejamentoMensal
) {
setPlanejamentoEditando(
planejamento
);

setMesPlanejamento(
  planejamento.mes
);

setAnoPlanejamento(
  planejamento.ano
);

setValorMetaMensal(
  String(planejamento.meta)
);

setErro("");

setModalPlanejamento(true);

}

async function salvarPlanejamento(
evento: FormEvent
) {
evento.preventDefault();

setErro("");

if (
  !valorMetaMensal ||
  Number(valorMetaMensal) < 0
) {
  setErro(
    "Digite uma meta válida."
  );

  return;
}

setSalvandoPlanejamento(true);

const valorMeta =
  Number(valorMetaMensal);

if (planejamentoEditando) {
  const { error } = await supabase
    .from("planejamento_mensal")
    .update({
      mes: mesPlanejamento,
      ano: anoPlanejamento,
      meta: valorMeta,
    })
    .eq(
      "id",
      planejamentoEditando.id
    );

  if (error) {
    setErro(error.message);

    setSalvandoPlanejamento(false);

    return;
  }
} else {
  const planejamentoExistente =
    planejamentos.find(
      (planejamento) =>
        planejamento.mes ===
          mesPlanejamento &&
        planejamento.ano ===
          anoPlanejamento
    );

  if (planejamentoExistente) {
    setErro(
      "Já existe uma meta cadastrada para este mês."
    );

    setSalvandoPlanejamento(false);

    return;
  }

  const { error } = await supabase
    .from("planejamento_mensal")
    .insert({
      mes: mesPlanejamento,
      ano: anoPlanejamento,
      meta: valorMeta,
    });

  if (error) {
    setErro(error.message);

    setSalvandoPlanejamento(false);

    return;
  }
}

setModalPlanejamento(false);

setSalvandoPlanejamento(false);

await registrarNotificacao(
  "Meta mensal atualizada",
  `A meta de ${nomeDoMes(mesPlanejamento)} de ${anoPlanejamento} foi atualizada.`,
  "meta"
);

await buscarDados();

}

/* ================================================= */
/* UPLOAD DE IMAGEM DO ENXOVAL */
/* ================================================= */

async function enviarImagemItem(
  evento: ChangeEvent<HTMLInputElement>,
  modo: "novo" | "edicao"
) {
  const arquivo = evento.target.files?.[0];
  evento.target.value = "";

  if (!arquivo) return;

  if (!arquivo.type.startsWith("image/")) {
    setErro("Escolha uma imagem válida.");
    return;
  }

  if (arquivo.size > 5 * 1024 * 1024) {
    setErro("A imagem deve ter no máximo 5 MB.");
    return;
  }

  setErro("");
  if (modo === "novo") setUploadandoImagemItem(true);
  else setUploadandoImagemItemEdicao(true);

  try {
    const extensao = arquivo.name.split(".").pop()?.toLowerCase() || "jpg";
    const nomeArquivo = `${crypto.randomUUID()}.${extensao}`;
    const caminho = `itens/${nomeArquivo}`;

    const { error: uploadError } = await supabase.storage
      .from("enxoval-imagens")
      .upload(caminho, arquivo, {
        upsert: false,
        contentType: arquivo.type,
        cacheControl: "3600",
      });

    if (uploadError) {
      setErro(
        `Não foi possível enviar a imagem. Verifique se o bucket \"enxoval-imagens\" foi criado no Supabase. ${uploadError.message}`
      );
      return;
    }

    const { data } = supabase.storage
      .from("enxoval-imagens")
      .getPublicUrl(caminho);

    if (modo === "novo") setImagemItem(data.publicUrl);
    else setImagemItemEdicao(data.publicUrl);
  } finally {
    if (modo === "novo") setUploadandoImagemItem(false);
    else setUploadandoImagemItemEdicao(false);
  }
}

/* ================================================= */
/* ADICIONAR ITEM */
/* ================================================= */

async function adicionarItem(
evento: FormEvent
) {
evento.preventDefault();

setErro("");

if (!nomeItem.trim()) {
  setErro(
    "Digite o nome do item."
  );

  return;
}

if (
  !valorItem ||
  Number(valorItem) < 0
) {
  setErro(
    "Digite um valor válido."
  );

  return;
}

setSalvandoItem(true);

const valorNumero =
  Number(valorItem);

const { error } = await supabase
  .from("itens_casa")
  .insert({
    nome: nomeItem.trim(),
    categoria: tipoNovoItem,

    tema:
      tipoNovoItem === "Enxoval"
        ? temaItem || "Outros"
        : null,

    quantidade:
      Number(
        quantidadeItem || 1
      ),

    valor_estimado:
      valorNumero,

    preco_estimado:
      valorNumero,

    comprado: false,

    loja:
      lojaItem || null,

    observacao:
      observacaoItem || null,

    imagem_url:
      tipoNovoItem === "Enxoval"
        ? imagemItem.trim() || null
        : null,
  });

if (error) {
  setErro(error.message);

  setSalvandoItem(false);

  return;
}

setNomeItem("");
setTemaItem("");
setValorItem("");
setQuantidadeItem("1");
setLojaItem("");
setObservacaoItem("");
setImagemItem("");

setModalItem(false);

setSalvandoItem(false);

await registrarNotificacao(
  "Novo item adicionado",
  `${nomeItem.trim()} foi adicionado ao planejamento.`,
  "casa"
);

await buscarDados();

}

/* ================================================= */
/* EDITAR ITEM */
/* ================================================= */

function abrirEdicaoItem(
item: ItemCasa
) {
setErro("");

setItemEditando(item);

setNomeItemEdicao(item.nome);

setTemaItemEdicao(
  item.tema || ""
);

const valorAtual =
  item.preco_estimado ??
  item.valor_estimado ??
  0;

setValorItemEdicao(
  String(valorAtual)
);

setQuantidadeItemEdicao(
  String(
    item.quantidade || 1
  )
);

setLojaItemEdicao(
  item.loja || ""
);

setObservacaoItemEdicao(
  item.observacao || ""
);

setImagemItemEdicao(item.imagem_url || "");

setCompradoItemEdicao(
  item.comprado || false
);

}

async function salvarEdicaoItem(
evento: FormEvent
) {
evento.preventDefault();

if (!itemEditando) {
  return;
}

if (
  !nomeItemEdicao.trim()
) {
  setErro(
    "Digite o nome do item."
  );

  return;
}

if (
  !valorItemEdicao ||
  Number(valorItemEdicao) < 0
) {
  setErro(
    "Digite um valor válido."
  );

  return;
}

setSalvandoEdicaoItem(true);

const valorNumero =
  Number(valorItemEdicao);

const { error } = await supabase
  .from("itens_casa")
  .update({
    nome:
      nomeItemEdicao.trim(),

    tema:
      itemEditando.categoria ===
      "Enxoval"
        ? temaItemEdicao || "Outros"
        : null,

    quantidade:
      Number(
        quantidadeItemEdicao ||
          1
      ),

    valor_estimado:
      valorNumero,

    preco_estimado:
      valorNumero,

    loja:
      lojaItemEdicao ||
      null,

    observacao:
      observacaoItemEdicao ||
      null,

    imagem_url:
      itemEditando.categoria ===
      "Enxoval"
        ? imagemItemEdicao.trim() || null
        : null,

    comprado:
      compradoItemEdicao,
  })
  .eq(
    "id",
    itemEditando.id
  );

if (error) {
  setErro(error.message);

  setSalvandoEdicaoItem(false);

  return;
}

const nomeNotificacaoItem = nomeItemEdicao.trim();
setItemEditando(null);

setSalvandoEdicaoItem(false);

await registrarNotificacao(
  "Item atualizado",
  `${nomeNotificacaoItem} foi atualizado.`,
  "casa"
);

await buscarDados();

}

/* ================================================= */
/* EXCLUIR ITEM */
/* ================================================= */

async function excluirItem() {
if (!itemParaExcluir) {
return;
}

setExcluindoItem(true);

const { error } = await supabase
  .from("itens_casa")
  .delete()
  .eq(
    "id",
    itemParaExcluir.id
  );

if (error) {
  setErro(error.message);

  setExcluindoItem(false);

  return;
}

const nomeExcluido = itemParaExcluir.nome;
setItemParaExcluir(null);

setExcluindoItem(false);

await registrarNotificacao(
  "Item removido",
  `${nomeExcluido} foi removido do planejamento.`,
  "casa"
);

await buscarDados();

}

/* ================================================= */
/* FINANÇAS */
/* ================================================= */

function pessoaFinanceiraAtual() {
  return abaFinancas;
}

function nomePessoaFinanceira(pessoa: string) {
  if (pessoa === "julia") return "Júlia";
  if (pessoa === "paulo") return "Paulo";
  return "Casal";
}

function categoriasDaAbaFinanceira() {
  // Cada aba mostra somente as categorias daquela pessoa.
  // Antes, Júlia/Paulo também recebiam as categorias do Casal,
  // fazendo cada categoria aparecer duas vezes.
  const categorias = categoriasFinanceiras.filter(
    (categoria) => categoria.pessoa === abaFinancas
  );

  // Segurança extra: se o banco tiver duplicatas, mostra apenas uma.
  const unicas = new Map<string, FinanceiroCategoria>();
  for (const categoria of categorias) {
    const chave = categoria.nome.trim().toLowerCase();
    if (!unicas.has(chave)) {
      unicas.set(chave, categoria);
    }
  }

  return Array.from(unicas.values()).sort((a, b) =>
    a.nome.localeCompare(b.nome, "pt-BR")
  );
}

function dividasDaAbaFinanceira() {
  return dividasFinanceiras.filter((divida) => divida.pessoa === abaFinancas);
}

function lancamentosDaAbaFinanceira() {
  return lancamentosFinanceiros.filter((item) => item.pessoa === abaFinancas);
}

function parcelasDaAbaFinanceira() {
  const ids = new Set(dividasDaAbaFinanceira().map((divida) => divida.id));
  return parcelasFinanceiras.filter((parcela) => ids.has(parcela.divida_id));
}

function abrirNovoLancamentoFinanceiro(tipo: "salario" | "ganho_adicional" | "gasto") {
  setLancamentoEditando(null);
  setDescricaoFinanceira("");
  setValorFinanceiro("");
  setDataFinanceira(dataLocalString());
  setCategoriaFinanceira(categoriasDaAbaFinanceira()[0]?.nome || "");
  setModalFinanceiro(tipo);
}

function abrirEdicaoLancamentoFinanceiro(item: FinanceiroLancamento) {
  setLancamentoEditando(item);
  setDescricaoFinanceira(item.descricao);
  setValorFinanceiro(String(item.valor));
  setDataFinanceira(item.data);
  setCategoriaFinanceira(item.categoria || "");
  setModalFinanceiro(item.tipo);
}

async function salvarLancamentoFinanceiro(evento: FormEvent) {
  evento.preventDefault();
  setErro("");

  if (!descricaoFinanceira.trim() || Number(valorFinanceiro) <= 0 || !dataFinanceira) {
    setErro("Preencha descrição, valor e data.");
    return;
  }

  setSalvandoFinanceiro(true);

  const dados = {
    pessoa: pessoaFinanceiraAtual(),
    tipo: modalFinanceiro === "salario" ? "salario" : modalFinanceiro === "ganho_adicional" ? "ganho_adicional" : "gasto",
    descricao: descricaoFinanceira.trim(),
    valor: Number(valorFinanceiro),
    data: dataFinanceira,
    categoria: categoriaFinanceira || null,
  };

  let resposta;

  if (lancamentoEditando) {
    resposta = await supabase
      .from("financas_lancamentos")
      .update(dados)
      .eq("id", lancamentoEditando.id)
      .select("*")
      .single();
  } else {
    resposta = await supabase
      .from("financas_lancamentos")
      .insert(dados)
      .select("*")
      .single();
  }

  if (resposta.error || !resposta.data) {
    setErro(resposta.error?.message || "Não foi possível salvar o lançamento financeiro.");
    setSalvandoFinanceiro(false);
    return;
  }

  if (lancamentoEditando) {
    setLancamentosFinanceiros((atuais) =>
      atuais.map((item) => item.id === lancamentoEditando.id ? resposta.data as FinanceiroLancamento : item)
    );
  } else {
    setLancamentosFinanceiros((atuais) => [resposta.data as FinanceiroLancamento, ...atuais]);
  }

  setModalFinanceiro(null);
  setLancamentoEditando(null);
  setSalvandoFinanceiro(false);

  await registrarNotificacao(
    modalFinanceiro === "salario" ? "Salário atualizado" : modalFinanceiro === "ganho_adicional" ? "Ganho adicional registrado" : "Gasto registrado",
    `${dados.descricao}: ${formatarMoeda(dados.valor)}.`,
    "financeiro"
  );
  await buscarDados();
}

async function excluirLancamentoFinanceiro(item: FinanceiroLancamento) {
  const confirmar = window.confirm(`Apagar "${item.descricao}"?`);
  if (!confirmar) return;

  const { error } = await supabase.from("financas_lancamentos").delete().eq("id", item.id);
  if (error) {
    setErro(error.message);
    return;
  }
  await buscarDados();
}

function abrirNovaDividaFinanceira() {
  setDividaEditando(null);
  setNomeDividaFinanceira("");
  setValorTotalDivida("");
  setParcelasDivida("1");
  setValorParcelaDivida("");
  setDataPrimeiraDivida(dataLocalString());
  setCategoriaDivida(categoriasDaAbaFinanceira()[0]?.nome || "");
  setModoValorDivida("total");
  setModalFinanceiro("divida");
}

function abrirEdicaoDividaFinanceira(divida: DividaFinanceira) {
  setDividaEditando(divida);
  setNomeDividaFinanceira(divida.nome);
  setValorTotalDivida(String(divida.valor_total));
  setParcelasDivida(String(divida.parcelas_total));
  setValorParcelaDivida(String(divida.valor_parcela));
  setDataPrimeiraDivida(divida.data_primeira);
  setCategoriaDivida(divida.categoria || "");
  setModoValorDivida("total");
  setModalFinanceiro("divida");
}

function adicionarMeses(dataBase: string, meses: number) {
  const [ano, mes, dia] = dataBase.split("-").map(Number);
  const data = new Date(ano, mes - 1 + meses, dia);
  const ultimoDia = new Date(data.getFullYear(), data.getMonth() + 1, 0).getDate();
  data.setDate(Math.min(dia, ultimoDia));
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`;
}

async function salvarDividaFinanceira(evento: FormEvent) {
  evento.preventDefault();
  setErro("");

  const totalParcelas = Math.max(1, Number(parcelasDivida));
  const valorInformado = Number(modoValorDivida === "total" ? valorTotalDivida : valorParcelaDivida);
  const valorTotal = modoValorDivida === "total"
    ? valorInformado
    : Number((valorInformado * totalParcelas).toFixed(2));
  const valorParcela = modoValorDivida === "total"
    ? Number(valorParcelaDivida || (valorTotal / totalParcelas)).toFixed(2)
    : Number(valorInformado).toFixed(2);
  const valorParcelaNumero = Number(valorParcela);

  if (!nomeDividaFinanceira.trim() || valorInformado <= 0 || totalParcelas <= 0 || valorParcelaNumero <= 0 || !dataPrimeiraDivida) {
    setErro(modoValorDivida === "total"
      ? "Preencha nome, valor total, parcelas e primeira data."
      : "Preencha nome, valor mensal, parcelas e primeira data.");
    return;
  }

  setSalvandoFinanceiro(true);

  if (dividaEditando) {
    const { error } = await supabase
      .from("financas_dividas")
      .update({
        nome: nomeDividaFinanceira.trim(),
        valor_total: valorTotal,
        parcelas_total: totalParcelas,
        valor_parcela: valorParcelaNumero,
        data_primeira: dataPrimeiraDivida,
        categoria: categoriaDivida || null,
        status: "ativa",
      })
      .eq("id", dividaEditando.id);

    if (error) {
      setErro(error.message);
      setSalvandoFinanceiro(false);
      return;
    }

    const parcelasDaDivida = parcelasFinanceiras.filter((p) => p.divida_id === dividaEditando.id);
    for (const parcela of parcelasDaDivida) {
      if (!parcela.paga) {
        const novaVencimento = adicionarMeses(dataPrimeiraDivida, parcela.numero - 1);
        await supabase
          .from("financas_parcelas")
          .update({ valor: valorParcela, vencimento: novaVencimento })
          .eq("id", parcela.id);
      }
    }
  } else {
    const { data: novaDivida, error } = await supabase
      .from("financas_dividas")
      .insert({
        pessoa: pessoaFinanceiraAtual(),
        nome: nomeDividaFinanceira.trim(),
        valor_total: valorTotal,
        parcelas_total: totalParcelas,
        valor_parcela: valorParcelaNumero,
        data_primeira: dataPrimeiraDivida,
        categoria: categoriaDivida || null,
        status: "ativa",
      })
      .select("*")
      .single();

    if (error || !novaDivida) {
      setErro(error?.message || "Não foi possível criar a dívida.");
      setSalvandoFinanceiro(false);
      return;
    }

    const parcelas = Array.from({ length: totalParcelas }, (_, index) => ({
      divida_id: novaDivida.id,
      numero: index + 1,
      valor: index === totalParcelas - 1
        ? Math.max(0, Number((valorTotal - valorParcelaNumero * (totalParcelas - 1)).toFixed(2)))
        : valorParcela,
      vencimento: adicionarMeses(dataPrimeiraDivida, index),
      paga: false,
      data_pagamento: null,
    }));

    const { error: erroParcelas } = await supabase
      .from("financas_parcelas")
      .insert(parcelas);

    if (erroParcelas) {
      // Não deixa uma dívida sem parcelas caso a criação das parcelas falhe.
      await supabase.from("financas_dividas").delete().eq("id", novaDivida.id);
      setErro(`A dívida não foi registrada porque as parcelas não puderam ser criadas: ${erroParcelas.message}`);
      setSalvandoFinanceiro(false);
      return;
    }
  }

  setModalFinanceiro(null);
  setDividaEditando(null);
  setSalvandoFinanceiro(false);

  await registrarNotificacao(
    dividaEditando ? "Dívida atualizada" : "Nova dívida adicionada",
    `${nomeDividaFinanceira.trim()} — ${totalParcelas} parcela(s).`,
    "financeiro"
  );
  await buscarDados();
}

async function excluirDividaFinanceira(divida: DividaFinanceira) {
  const confirmar = window.confirm(`Apagar a dívida "${divida.nome}" e todas as parcelas?`);
  if (!confirmar) return;

  const { error } = await supabase.from("financas_dividas").delete().eq("id", divida.id);
  if (error) {
    setErro(error.message);
    return;
  }
  await buscarDados();
}

async function alternarParcelaFinanceira(parcela: ParcelaFinanceira) {
  const novaPaga = !parcela.paga;
  const { error } = await supabase
    .from("financas_parcelas")
    .update({
      paga: novaPaga,
      data_pagamento: novaPaga ? dataLocalString() : null,
    })
    .eq("id", parcela.id);

  if (error) {
    setErro(error.message);
    return;
  }

  const divida = dividasFinanceiras.find((item) => item.id === parcela.divida_id);
  if (divida) {
    const todas = parcelasFinanceiras.filter((item) => item.divida_id === divida.id);
    const pagas = todas.filter((item) => item.id === parcela.id ? novaPaga : item.paga).length;
    if (pagas >= divida.parcelas_total) {
      await supabase.from("financas_dividas").update({ status: "quitada" }).eq("id", divida.id);
    } else {
      await supabase.from("financas_dividas").update({ status: "ativa" }).eq("id", divida.id);
    }
  }

  await buscarDados();
}

async function salvarValorParcelaFinanceira(evento: FormEvent) {
  evento.preventDefault();
  if (!parcelaEditando || Number(valorParcelaEdicao) <= 0) return;

  const { error } = await supabase
    .from("financas_parcelas")
    .update({ valor: Number(valorParcelaEdicao) })
    .eq("id", parcelaEditando.id);

  if (error) {
    setErro(error.message);
    return;
  }

  setParcelaEditando(null);
  setValorParcelaEdicao("");
  await buscarDados();
}

function abrirEdicaoParcelaFinanceira(parcela: ParcelaFinanceira) {
  setParcelaEditando(parcela);
  setValorParcelaEdicao(String(parcela.valor));
}

async function salvarCategoriaFinanceira(evento: FormEvent) {
  evento.preventDefault();
  if (!nomeCategoriaFinanceira.trim()) {
    setErro("Digite o nome da categoria.");
    return;
  }

  const dados = {
    pessoa: abaFinancas,
    nome: nomeCategoriaFinanceira.trim(),
    emoji: emojiCategoriaFinanceira || "📦",
  };

  let resposta;

  if (categoriaEditando) {
    resposta = await supabase
      .from("financas_categorias")
      .update(dados)
      .eq("id", categoriaEditando.id)
      .select("*")
      .single();
  } else {
    resposta = await supabase
      .from("financas_categorias")
      .insert(dados)
      .select("*")
      .single();
  }

  if (resposta.error || !resposta.data) {
    setErro(resposta.error?.message || "Não foi possível salvar a categoria.");
    return;
  }

  if (categoriaEditando) {
    setCategoriasFinanceiras((atuais) =>
      atuais.map((item) => item.id === categoriaEditando.id ? resposta.data as FinanceiroCategoria : item)
    );
  } else {
    setCategoriasFinanceiras((atuais) => [resposta.data as FinanceiroCategoria, ...atuais]);
  }

  setModalFinanceiro(null);
  setCategoriaEditando(null);
  setNomeCategoriaFinanceira("");
  setEmojiCategoriaFinanceira("📦");
  await buscarDados();
}

async function excluirCategoriaFinanceira(categoria: FinanceiroCategoria) {
  const usada = categoriasFinanceiras.some((c) => c.id === categoria.id);
  if (!usada) return;

  const confirmar = window.confirm(`Apagar a categoria "${categoria.nome}"?`);
  if (!confirmar) return;

  const { error } = await supabase.from("financas_categorias").delete().eq("id", categoria.id);
  if (error) {
    setErro("Essa categoria pode estar sendo usada. Altere os registros antes de excluir.");
    return;
  }
  await buscarDados();
}

function abrirNovaCategoriaFinanceira() {
  setCategoriaEditando(null);
  setNomeCategoriaFinanceira("");
  setEmojiCategoriaFinanceira("📦");
  setModalFinanceiro("categoria");
}

function abrirEdicaoCategoriaFinanceira(categoria: FinanceiroCategoria) {
  setCategoriaEditando(categoria);
  setNomeCategoriaFinanceira(categoria.nome);
  setEmojiCategoriaFinanceira(categoria.emoji);
  setModalFinanceiro("categoria");
}

function formatarDataCurta(data: string) {
  return new Date(`${data}T12:00:00`).toLocaleDateString("pt-BR");
}

function deslocarMesFinanceiro(delta: number) {
  const novaData = new Date(anoFinanceiro, mesFinanceiro + delta, 1);
  setMesFinanceiro(novaData.getMonth());
  setAnoFinanceiro(novaData.getFullYear());
}

/* ================================================= */
/* NOSSA AGENDA */
/* ================================================= */

function dataLocalString(
dataBase = new Date()
) {
  const ano = dataBase.getFullYear();
  const mes = String(dataBase.getMonth() + 1).padStart(2, "0");
  const dia = String(dataBase.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

const EMOJIS_AGENDA = [
  "💑",
  "🎂",
  "🎉",
  "📌",
  "🏠",
  "✈️",
  "🍽️",
  "🎬",
  "🎡",
  "🎁",
  "🛍️",
  "💰",
  "📚",
  "☕",
  "🎮",
  "📅",
];

function emojiPadraoPorCategoria(categoria: string | null) {
  switch (categoria) {
    case "Data importante":
      return "🎉";
    case "Compromisso":
      return "📌";
    case "Nossa casa":
      return "🏠";
    case "Fazer juntos":
      return "💑";
    default:
      return "📅";
  }
}

function emojiDoEvento(evento: EventoAgenda) {
  return evento.emoji || emojiPadraoPorCategoria(evento.categoria);
}

function abrirNovoEvento(dataSelecionada = dataLocalString()) {
  setEventoEditando(null);
  setTituloEvento("");
  setDataEvento(dataSelecionada);
  setHorarioEvento("");
  setCategoriaEvento("Fazer juntos");
  setEmojiEvento("💑");
  setDescricaoEvento("");
  setRecorrenciaEvento("nenhuma");
  setErro("");
  setModalAgenda(true);
}

function abrirEdicaoEvento(evento: EventoAgenda) {
  setEventoEditando(evento);
  setTituloEvento(evento.titulo);
  setDataEvento(evento.data);
  setHorarioEvento(evento.horario || "");
  setCategoriaEvento(evento.categoria || "Fazer juntos");
  setEmojiEvento(evento.emoji || emojiPadraoPorCategoria(evento.categoria));
  setDescricaoEvento(evento.descricao || "");
  setRecorrenciaEvento(evento.recorrencia || "nenhuma");
  setErro("");
  setModalAgenda(true);
}

async function salvarEventoAgenda(evento: FormEvent) {
  evento.preventDefault();
  setErro("");

  if (!tituloEvento.trim()) {
    setErro("Digite o título da programação.");
    return;
  }

  if (!dataEvento) {
    setErro("Escolha uma data.");
    return;
  }

  setSalvandoEvento(true);

  const dados = {
    titulo: tituloEvento.trim(),
    data: dataEvento,
    horario: horarioEvento || null,
    categoria: categoriaEvento || "Outros",
    emoji: emojiEvento || emojiPadraoPorCategoria(categoriaEvento),
    descricao: descricaoEvento.trim() || null,
    recorrencia: recorrenciaEvento || "nenhuma",
    concluido: eventoEditando?.concluido || false,
  };

  const resposta = eventoEditando
    ? await supabase
        .from("agenda_eventos")
        .update(dados)
        .eq("id", eventoEditando.id)
    : await supabase
        .from("agenda_eventos")
        .insert(dados);

  if (resposta.error) {
    setErro(resposta.error.message);
    setSalvandoEvento(false);
    return;
  }

  const tituloNotificacao = eventoEditando
    ? "Programação atualizada"
    : "Nova programação adicionada";

  setModalAgenda(false);
  setEventoEditando(null);
  setSalvandoEvento(false);

  await registrarNotificacao(
    tituloNotificacao,
    `${dados.titulo} — ${dados.data}${dados.horario ? ` às ${dados.horario}` : ""}.`,
    "agenda"
  );

  await buscarDados();
}

async function alternarConcluidoEvento(evento: EventoAgenda) {
  const novoStatus = !evento.concluido;

  const { error } = await supabase
    .from("agenda_eventos")
    .update({ concluido: novoStatus })
    .eq("id", evento.id);

  if (error) {
    setErro(error.message);
    return;
  }

  await registrarNotificacao(
    novoStatus ? "Programação concluída" : "Programação reaberta",
    `${evento.titulo} foi ${novoStatus ? "marcada como concluída" : "marcada novamente como pendente"}.`,
    "agenda"
  );

  await buscarDados();
}

async function excluirEventoAgenda(evento: EventoAgenda) {
  const { error } = await supabase
    .from("agenda_eventos")
    .delete()
    .eq("id", evento.id);

  if (error) {
    setErro(error.message);
    return;
  }

  await registrarNotificacao(
    "Programação removida",
    `${evento.titulo} foi removida da nossa agenda.`,
    "agenda"
  );

  await buscarDados();
}

function separarDataAgenda(dataString: string) {
  const [ano, mes, dia] = String(dataString || "")
    .slice(0, 10)
    .split("-")
    .map(Number);

  return {
    ano: Number.isFinite(ano) ? ano : 0,
    mes: Number.isFinite(mes) ? mes : 0,
    dia: Number.isFinite(dia) ? dia : 0,
  };
}

function normalizarRecorrenciaEvento(evento: EventoAgenda) {
  return String(evento.recorrencia || "nenhuma")
    .trim()
    .toLowerCase();
}

function diasNoMes(ano: number, mes: number) {
  return new Date(ano, mes + 1, 0).getDate();
}

function dataOcorrenciaEvento(
  evento: EventoAgenda,
  ano: number,
  mes: number
): number | null {
  const dataOriginal = separarDataAgenda(evento.data);
  const recorrencia = normalizarRecorrenciaEvento(evento);

  if (!dataOriginal.ano || !dataOriginal.mes || !dataOriginal.dia) {
    return null;
  }

  if (recorrencia === "nenhuma") {
    if (
      dataOriginal.ano !== ano ||
      dataOriginal.mes !== mes + 1
    ) {
      return null;
    }

    return dataOriginal.dia;
  }

  if (recorrencia === "mensal") {
    const dataVisualizada = new Date(ano, mes, 1);
    const dataInicial = new Date(
      dataOriginal.ano,
      dataOriginal.mes - 1,
      1
    );

    if (dataVisualizada < dataInicial) {
      return null;
    }

    return Math.min(
      dataOriginal.dia,
      diasNoMes(ano, mes)
    );
  }

  if (recorrencia === "anual") {
    if (
      ano < dataOriginal.ano ||
      mes + 1 !== dataOriginal.mes
    ) {
      return null;
    }

    return Math.min(
      dataOriginal.dia,
      diasNoMes(ano, mes)
    );
  }

  return null;
}

function eventoAconteceNoDia(evento: EventoAgenda, dia: number) {
  return (
    dataOcorrenciaEvento(
      evento,
      anoAgenda,
      mesAgenda
    ) === dia
  );
}

function formatarDataAgenda(dataString: string) {
  return new Date(`${dataString}T12:00:00`).toLocaleDateString("pt-BR");
}

function eventosDoDia(dia: number) {
  return eventosAgenda.filter((evento) =>
    eventoAconteceNoDia(evento, dia)
  );
}

function mudarMesAgenda(direcao: number) {
  const novaData = new Date(anoAgenda, mesAgenda + direcao, 1);
  setMesAgenda(novaData.getMonth());
  setAnoAgenda(novaData.getFullYear());
}

async function marcarNotificacaoComoLida(id: string) {
  const { error } = await supabase
    .from("notificacoes")
    .update({ lida: true })
    .eq("id", id);

  if (!error) {
    setNotificacoes((atual) =>
      atual.map((item) =>
        item.id === id ? { ...item, lida: true } : item
      )
    );
  }
}

async function marcarTodasNotificacoesComoLidas() {
  const pendentes = notificacoes.filter((item) => !item.lida);
  if (pendentes.length === 0) return;

  const { error } = await supabase
    .from("notificacoes")
    .update({ lida: true })
    .eq("lida", false);

  if (!error) {
    setNotificacoes((atual) =>
      atual.map((item) => ({ ...item, lida: true }))
    );
  }
}

/* ================================================= */
/* NOME DA PESSOA */
/* ================================================= */

function nomeDaPessoa(
pessoaId: string
) {
return (
pessoas.find(
(pessoa) =>
pessoa.id === pessoaId
)?.nome || "Pessoa"
);
}

/* ================================================= */
/* CÁLCULOS */
/* ================================================= */

function totalDoMes(
mes: number,
ano: number
) {
return aportes
.filter((aporte) => {
const dataAporte =
new Date(
`${aporte.data}T12:00:00`
);

    return (
      dataAporte.getMonth() +
        1 ===
        mes &&
      dataAporte.getFullYear() ===
        ano
    );
  })
  .reduce(
    (
      acumulado,
      aporte
    ) =>
      acumulado +
      Number(aporte.valor),
    0
  );

}

function guardadoPessoaNoMes(
pessoaId: string,
mes: number,
ano: number
) {
return aportes
.filter((aporte) => {
const dataAporte =
new Date(
`${aporte.data}T12:00:00`
);

    return (
      aporte.pessoa_id ===
        pessoaId &&
      dataAporte.getMonth() +
        1 ===
        mes &&
      dataAporte.getFullYear() ===
        ano
    );
  })
  .reduce(
    (
      acumulado,
      aporte
    ) =>
      acumulado +
      Number(aporte.valor),
    0
  );

}

function valorDoItem(
item: ItemCasa
) {
const valor =
Number(
item.preco_estimado ??
item.valor_estimado ??
0
);

const quantidade =
  Number(
    item.quantidade || 1
  );

return valor * quantidade;

}

const falta =
Math.max(
meta - total,
0
);

const excedente =
Math.max(
total - meta,
0
);

const progresso =
meta > 0
? Math.min(
(total / meta) * 100,
100
)
: 0;

const itensGrandes =
itensCasa.filter(
(item) =>
item.categoria === "Casa" ||
!item.categoria
);

const itensEnxoval =
itensCasa.filter(
(item) =>
item.categoria ===
"Enxoval"
);

const totalItens =
itensGrandes.reduce(
(acumulado, item) =>
acumulado +
valorDoItem(item),
0
);

const totalEnxoval =
itensEnxoval.reduce(
(acumulado, item) =>
acumulado +
valorDoItem(item),
0
);

const itensComprados =
itensCasa.filter(
(item) =>
item.comprado
).length;

const hoje = new Date();

const mesAtual =
hoje.getMonth() + 1;

const anoAtual =
hoje.getFullYear();

const planejamentoAtual =
planejamentos.find(
(planejamento) =>
planejamento.mes ===
mesAtual &&
planejamento.ano ===
anoAtual
);

const metaAtual =
planejamentoAtual
? Number(
planejamentoAtual.meta
)
: 500;

const totalMesAtual =
totalDoMes(
mesAtual,
anoAtual
);

const faltaMetaMensal =
Math.max(
metaAtual -
totalMesAtual,
0
);

const progressoMensal =
metaAtual > 0
? Math.min(
(totalMesAtual /
metaAtual) *
100,
100
)
: 0;

/* ================================================= */
/* CARREGANDO */
/* ================================================= */

if (carregando) {
return ( <main className="min-h-screen w-full overflow-x-hidden bg-slate-50 flex items-center justify-center p-4"> <div className="w-full max-w-sm bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-xl text-center"> <div className="text-5xl animate-bounce">
🏠 </div>

      <p className="text-slate-500 mt-4">
        Carregando nosso plano...
      </p>
    </div>
  </main>
);

}

/* ================================================= */
/* TELA */
/* ================================================= */

return ( <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 text-slate-800"> <div className="flex min-h-screen w-full">

    {/* MENU DESKTOP */}

    <aside className="hidden md:flex w-72 shrink-0 bg-white border-r border-slate-200 flex-col p-6 fixed h-screen z-40">

      <div className="mb-8">

        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-pink-400 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
          🏠
        </div>

        <p className="text-xs text-blue-500 uppercase tracking-widest mt-5 font-semibold">
          Nosso projeto
        </p>

        <h1 className="text-2xl font-bold mt-2 text-slate-800">
          Plano Juntos
        </h1>

        <p className="text-slate-500 text-sm mt-2">
          Construindo nosso futuro 🩷
        </p>

      </div>

      <nav className="space-y-2">

        <button
          onClick={() =>
            setAbaAtiva(
              "visao-geral"
            )
          }
          className={`w-full text-left px-4 py-3 rounded-xl transition font-medium ${
            abaAtiva ===
            "visao-geral"
              ? "bg-blue-50 text-blue-600"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          📊 Visão geral
        </button>

        <button
          onClick={() =>
            setAbaAtiva(
              "aportes"
            )
          }
          className={`w-full text-left px-4 py-3 rounded-xl transition font-medium ${
            abaAtiva ===
            "aportes"
              ? "bg-blue-50 text-blue-600"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          💰 Aportes
        </button>

        <button
          onClick={() =>
            setAbaAtiva(
              "financas"
            )
          }
          className={`w-full text-left px-4 py-3 rounded-xl transition font-medium ${
            abaAtiva === "financas"
              ? "bg-emerald-50 text-emerald-600"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          💵 Finanças
        </button>

        <button
          onClick={() =>
            setAbaAtiva(
              "planejamento"
            )
          }
          className={`w-full text-left px-4 py-3 rounded-xl transition font-medium ${
            abaAtiva ===
            "planejamento"
              ? "bg-blue-50 text-blue-600"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          📅 Planejamento
        </button>

        <button
          onClick={() =>
            setAbaAtiva(
              "itens"
            )
          }
          className={`w-full text-left px-4 py-3 rounded-xl transition font-medium ${
            abaAtiva ===
            "itens"
              ? "bg-blue-50 text-blue-600"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          🏠 Itens da casa
        </button>

        <button
          onClick={() =>
            setAbaAtiva(
              "enxoval"
            )
          }
          className={`w-full text-left px-4 py-3 rounded-xl transition font-medium ${
            abaAtiva ===
            "enxoval"
              ? "bg-pink-50 text-pink-600"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          🧺 Enxoval
        </button>

        <button
          onClick={() =>
            setAbaAtiva("agenda")
          }
          className={`w-full text-left px-4 py-3 rounded-xl transition font-medium ${
            abaAtiva === "agenda"
              ? "bg-pink-50 text-pink-600"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          ❤️ Nossa Agenda
        </button>

      </nav>

      <div className="mt-auto pt-6">

        <div className="bg-gradient-to-br from-blue-50 to-pink-50 border border-blue-100 rounded-2xl p-5">

          <p className="text-xs text-blue-500 uppercase tracking-wider font-bold">
            Nosso propósito
          </p>

          <p className="text-slate-700 font-semibold mt-2">
            Construindo nossa futura casa juntos 🏠🩷
          </p>

        </div>

      </div>

    </aside>

    {/* CONTEÚDO */}

    <div className="flex-1 min-w-0 w-full md:ml-72">

      {/* MENU MOBILE */}

      <div className="md:hidden w-full max-w-full bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">

        <div className="p-4 flex items-center gap-3">

          <div className="w-11 h-11 shrink-0 bg-gradient-to-br from-blue-500 to-pink-400 rounded-xl flex items-center justify-center text-2xl">
            🏠
          </div>

          <div className="min-w-0">

            <h1 className="font-bold text-slate-800 truncate">
              Plano Juntos
            </h1>

            <p className="text-xs text-slate-500">
              Nosso futuro 🩷
            </p>

          </div>

        </div>

        <div className="flex gap-2 overflow-x-auto px-4 pb-4">

          {[
            [
              "visao-geral",
              "📊 Geral",
            ],
            [
              "aportes",
              "💰 Aportes",
            ],
            [
              "financas",
              "💵 Finanças",
            ],
            [
              "planejamento",
              "📅 Metas",
            ],
            [
              "itens",
              "🏠 Casa",
            ],
            [
              "enxoval",
              "🧺 Enxoval",
            ],
            [
              "agenda",
              "❤️ Agenda",
            ],
          ].map(
            ([id, nome]) => (
              <button
                key={id}
                onClick={() =>
                  setAbaAtiva(
                    id as Aba
                  )
                }
                className={`shrink-0 whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium ${
                  abaAtiva === id
                    ? "bg-blue-500 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {nome}
              </button>
            )
          )}

        </div>

      </div>

      {/* CONTEÚDO */}

      <div className="w-full min-w-0 p-4 sm:p-5 md:p-10 max-w-7xl mx-auto">

        <div className="flex justify-end mb-4 relative">
          <button
            type="button"
            onClick={() => setNotificacoesAbertas((aberta) => !aberta)}
            className="relative w-11 h-11 rounded-xl bg-white border border-slate-200 shadow-sm hover:bg-slate-50 text-xl"
            aria-label="Notificações"
          >
            🔔
            {notificacoes.filter((item) => !item.lida).length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-pink-500 text-white text-[11px] font-bold flex items-center justify-center">
                {notificacoes.filter((item) => !item.lida).length > 9 ? "9+" : notificacoes.filter((item) => !item.lida).length}
              </span>
            )}
          </button>

          {notificacoesAbertas && (
            <div className="absolute right-0 top-12 z-50 w-[min(92vw,380px)] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-800">🔔 Novidades</h3>
                  <p className="text-xs text-slate-500 mt-1">Atualizações do Plano Juntos</p>
                </div>
                <button
                  type="button"
                  onClick={marcarTodasNotificacoesComoLidas}
                  className="text-xs text-blue-600 font-semibold hover:underline"
                >
                  Marcar lidas
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notificacoes.length === 0 ? (
                  <div className="p-6 text-center text-sm text-slate-500">
                    Nenhuma novidade por enquanto.
                  </div>
                ) : (
                  notificacoes.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => marcarNotificacaoComoLida(item.id)}
                      className={`w-full text-left p-4 border-b border-slate-100 hover:bg-slate-50 ${item.lida ? "bg-white" : "bg-blue-50/40"}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-lg">
                          {item.tipo === "agenda" ? "❤️" : item.tipo === "financeiro" ? "💰" : item.tipo === "casa" ? "🏠" : "🔔"}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm text-slate-800 break-words">{item.titulo}</p>
                          <p className="text-xs text-slate-500 mt-1 break-words">{item.mensagem}</p>
                          {item.created_at && (
                            <p className="text-[11px] text-slate-400 mt-2">
                              {new Date(item.created_at).toLocaleString("pt-BR")}
                            </p>
                          )}
                        </div>
                        {!item.lida && <span className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {erro && (
          <div className="mb-6 break-words bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl">
            {erro}
          </div>
        )}

        {/* VISÃO GERAL */}

        {abaAtiva ===
          "visao-geral" && (
          <>

            <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 shadow-sm mb-6 sm:mb-8">

              <p className="text-blue-500 font-semibold">
                Bem-vindos de volta 👋
              </p>

              <h2 className="text-3xl sm:text-4xl md:text-5xl leading-tight font-bold mt-3 text-slate-800">
                Construindo nosso
                <br className="hidden sm:block" />
                {" "}
                futuro juntos 🏠🩷
              </h2>

              <p className="text-slate-500 mt-4 max-w-xl">
                Cada aporte, cada meta
                e cada item comprado é
                mais um passo rumo ao
                nosso sonho.
              </p>

            </div>

            <div className="bg-gradient-to-r from-blue-50 to-pink-50 border border-blue-100 rounded-2xl sm:rounded-3xl p-5 sm:p-7 mb-6 sm:mb-8 text-center">

              <p className="text-blue-500 font-bold text-xs sm:text-sm uppercase tracking-widest">
                Mateus 19:06
              </p>

              <p className="text-slate-700 text-base sm:text-lg md:text-xl italic font-medium mt-3">
                “Assim, eles já não são
                dois, mas sim uma só
                carne. Portanto, o que
                Deus uniu, ninguém
                separe.”
              </p>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">

              <ResumoCard
                titulo="Total guardado"
                valor={formatarMoeda(
                  total
                )}
                icone="💰"
                cor="blue"
              />

              <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm">

                <div className="flex items-start justify-between gap-3">

                  <div className="min-w-0">

                    <p className="text-slate-500">
                      🎯 Meta principal
                    </p>

                    <h3 className="text-2xl sm:text-3xl font-bold mt-3 break-words">
                      {formatarMoeda(
                        meta
                      )}
                    </h3>

                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setMetaPrincipalEditando(
                        String(meta)
                      );

                      setModalMetaPrincipal(
                        true
                      );
                    }}
                    className="shrink-0 w-11 h-11 rounded-xl bg-blue-50 hover:bg-blue-100"
                  >
                    ✏️
                  </button>

                </div>

              </div>

              <ResumoCard
                titulo="Falta para a meta"
                valor={formatarMoeda(
                  falta
                )}
                icone="📉"
                cor="pink"
              />

            </div>

            <section className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-7 mt-5 sm:mt-6">

              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">

                <div>

                  <h3 className="text-xl font-bold">
                    🎯 Progresso geral
                  </h3>

                  <p className="text-slate-500 text-sm mt-1">
                    Nosso caminho até o
                    objetivo.
                  </p>

                </div>

                <strong className="text-2xl text-blue-600">
                  {progresso.toFixed(1)}%
                </strong>

              </div>

              <div className="w-full h-5 bg-slate-100 rounded-full overflow-hidden mt-6">

                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-pink-400 rounded-full transition-all duration-700"
                  style={{
                    width: `${progresso}%`,
                  }}
                />

              </div>

              <p className="mt-5 text-slate-600 break-words">

                {total >= meta
                  ? `🎉 Vocês ultrapassaram a meta em ${formatarMoeda(
                      excedente
                    )}!`
                  : `Faltam ${formatarMoeda(
                      falta
                    )} para alcançar o objetivo.`}

              </p>

            </section>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 mt-5 sm:mt-6">

              <ResumoCard
                titulo="Itens da casa"
                valor={formatarMoeda(
                  totalItens
                )}
                icone="🏠"
                cor="blue"
              />

              <ResumoCard
                titulo="Enxoval"
                valor={formatarMoeda(
                  totalEnxoval
                )}
                icone="🧺"
                cor="pink"
              />

              <ResumoCard
                titulo="Itens comprados"
                valor={`${itensComprados} item(ns)`}
                icone="✅"
                cor="blue"
              />

            </div>

          </>
        )}

        {/* APORTES */}

        {abaAtiva ===
          "aportes" && (
          <>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-6 sm:mb-8">

              <div className="min-w-0">

                <p className="text-slate-500">
                  Controle financeiro
                </p>

                <h2 className="text-3xl md:text-4xl font-bold mt-2 break-words">
                  💰 Aportes
                </h2>

              </div>

              <button
                onClick={() =>
                  setModalAporteAberto(
                    true
                  )
                }
                className="w-full sm:w-auto shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-sm"
              >
                + Adicionar aporte
              </button>

            </div>

            <section className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-7">

              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">

                <div>

                  <p className="text-slate-500">
                    {nomeDoMes(
                      mesAtual
                    )}{" "}
                    de {anoAtual}
                  </p>

                  <h3 className="text-xl sm:text-2xl font-bold mt-1">
                    📅 Meta deste mês
                  </h3>

                </div>

                <button
                  onClick={() => {
                    if (
                      planejamentoAtual
                    ) {
                      abrirEdicaoPlanejamento(
                        planejamentoAtual
                      );
                    } else {
                      abrirNovoPlanejamento();
                    }
                  }}
                  className="w-full sm:w-auto border border-blue-200 text-blue-600 px-4 py-2 rounded-xl hover:bg-blue-50"
                >
                  ✏️ Editar
                </button>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">

                <ResumoCard
                  titulo="Meta"
                  valor={formatarMoeda(
                    metaAtual
                  )}
                  icone="🎯"
                  cor="blue"
                />

                <ResumoCard
                  titulo="Guardado"
                  valor={formatarMoeda(
                    totalMesAtual
                  )}
                  icone="💰"
                  cor="pink"
                />

                <ResumoCard
                  titulo="Falta"
                  valor={formatarMoeda(
                    faltaMetaMensal
                  )}
                  icone="📉"
                  cor="blue"
                />

              </div>

              <div className="mt-6">

                <div className="flex justify-between gap-3 text-sm mb-2">

                  <span>
                    Progresso
                  </span>

                  <strong className="shrink-0 text-blue-600">
                    {progressoMensal.toFixed(
                      1
                    )}
                    %
                  </strong>

                </div>

                <div className="h-4 bg-slate-100 rounded-full overflow-hidden">

                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-pink-400"
                    style={{
                      width: `${progressoMensal}%`,
                    }}
                  />

                </div>

              </div>

            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mt-5 sm:mt-6">

              {pessoas.map(
                (pessoa) => {
                  const guardado =
                    guardadoPessoaNoMes(
                      pessoa.id,
                      mesAtual,
                      anoAtual
                    );

                  const metaIndividual =
                    pessoas.length > 0
                      ? metaAtual /
                        pessoas.length
                      : metaAtual;

                  const porcentagem =
                    metaIndividual > 0
                      ? Math.min(
                          (guardado /
                            metaIndividual) *
                            100,
                          100
                        )
                      : 0;

                  return (
                    <div
                      key={pessoa.id}
                      className="min-w-0 bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm"
                    >

                      <h3 className="text-xl font-bold break-words">
                        👤 {pessoa.nome}
                      </h3>

                      <div className="flex justify-between gap-4 mt-6">

                        <div className="min-w-0">

                          <p className="text-sm text-slate-500">
                            Meta
                          </p>

                          <strong className="break-words">
                            {formatarMoeda(
                              metaIndividual
                            )}
                          </strong>

                        </div>

                        <div className="min-w-0 text-right">

                          <p className="text-sm text-slate-500">
                            Guardado
                          </p>

                          <strong className="text-blue-600 break-words">
                            {formatarMoeda(
                              guardado
                            )}
                          </strong>

                        </div>

                      </div>

                      <div className="h-3 bg-slate-100 rounded-full overflow-hidden mt-5">

                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-pink-400"
                          style={{
                            width: `${porcentagem}%`,
                          }}
                        />

                      </div>

                    </div>
                  );
                }
              )}

            </div>

            <section className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-5 sm:p-6 mt-6 sm:mt-8 shadow-sm">

              <h3 className="text-xl sm:text-2xl font-bold">
                📋 Histórico de aportes
              </h3>

              <div className="space-y-3 mt-6">

                {aportes.length ===
                0 ? (
                  <p className="text-slate-500">
                    Nenhum aporte registrado
                    ainda.
                  </p>
                ) : (
                  aportes.map(
                    (aporte) => (
                      <div
                        key={aporte.id}
                        className="min-w-0 border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                      >

                        <div className="min-w-0">

                          <strong className="break-words">
                            👤{" "}
                            {nomeDaPessoa(
                              aporte.pessoa_id
                            )}
                          </strong>

                          <p className="text-blue-600 font-bold text-xl mt-1">
                            {formatarMoeda(
                              Number(
                                aporte.valor
                              )
                            )}
                          </p>

                          <p className="text-sm text-slate-500">
                            📅{" "}
                            {new Date(
                              `${aporte.data}T12:00:00`
                            ).toLocaleDateString(
                              "pt-BR"
                            )}
                          </p>

                          {aporte.observacao && (
                            <p className="text-sm text-slate-500 mt-1 break-words">
                              📝{" "}
                              {
                                aporte.observacao
                              }
                            </p>
                          )}

                        </div>

                        <div className="flex gap-2 shrink-0">

                          <button
                            onClick={() =>
                              abrirEdicaoAporte(
                                aporte
                              )
                            }
                            className="w-11 h-11 border border-slate-200 rounded-xl"
                          >
                            ✏️
                          </button>

                          <button
                            onClick={() =>
                              setAporteParaExcluir(
                                aporte
                              )
                            }
                            className="w-11 h-11 bg-red-500 text-white rounded-xl"
                          >
                            🗑️
                          </button>

                        </div>

                      </div>
                    )
                  )
                )}

              </div>

            </section>

          </>
        )}

        {/* PLANEJAMENTO */}

        {abaAtiva ===
          "planejamento" && (
          <>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-6 sm:mb-8">

              <div>

                <p className="text-slate-500">
                  Organização financeira
                </p>

                <h2 className="text-3xl md:text-4xl font-bold mt-2 break-words">
                  📅 Planejamento mensal
                </h2>

                <p className="text-slate-500 mt-2">
                  Crie e edite as metas
                  de cada mês.
                </p>

              </div>

              <button
                onClick={
                  abrirNovoPlanejamento
                }
                className="w-full sm:w-auto shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-semibold"
              >
                + Nova meta mensal
              </button>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">

              {planejamentos.length ===
              0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-8">

                  <div className="text-5xl">
                    📅
                  </div>

                  <h3 className="text-xl font-bold mt-4">
                    Nenhuma meta criada
                  </h3>

                  <p className="text-slate-500 mt-2">
                    Crie sua primeira meta
                    mensal.
                  </p>

                </div>
              ) : (
                [...planejamentos]
                  .sort((a, b) => {
                    const indiceA = a.ano * 12 + a.mes;
                    const indiceB = b.ano * 12 + b.mes;
                    return indiceA - indiceB;
                  })
                  .map(
                    (
                      planejamento
                    ) => {
                    const guardado =
                      totalDoMes(
                        planejamento.mes,
                        planejamento.ano
                      );

                    const progresso =
                      planejamento.meta >
                      0
                        ? Math.min(
                            (guardado /
                              planejamento.meta) *
                              100,
                            100
                          )
                        : 0;

                    const falta =
                      Math.max(
                        planejamento.meta -
                          guardado,
                        0
                      );

                    return (
                      <div
                        key={
                          planejamento.id
                        }
                        className="min-w-0 bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm"
                      >

                        <div className="flex justify-between gap-3">

                          <div className="min-w-0">

                            <p className="text-blue-500 font-medium break-words">
                              📅{" "}
                              {nomeDoMes(
                                planejamento.mes
                              )}
                            </p>

                            <h3 className="text-2xl font-bold">
                              {
                                planejamento.ano
                              }
                            </h3>

                          </div>

                          <button
                            onClick={() =>
                              abrirEdicaoPlanejamento(
                                planejamento
                              )
                            }
                            className="shrink-0 w-10 h-10 bg-blue-50 rounded-xl"
                          >
                            ✏️
                          </button>

                        </div>

                        <div className="mt-6">

                          <p className="text-sm text-slate-500">
                            Meta mensal
                          </p>

                          <strong className="text-2xl break-words">
                            {formatarMoeda(
                              planejamento.meta
                            )}
                          </strong>

                        </div>

                        <div className="mt-5">

                          <div className="flex justify-between gap-3 text-sm">

                            <span>
                              Guardado
                            </span>

                            <strong className="text-right break-words">
                              {formatarMoeda(
                                guardado
                              )}
                            </strong>

                          </div>

                          <div className="h-3 bg-slate-100 rounded-full overflow-hidden mt-3">

                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-pink-400"
                              style={{
                                width: `${progresso}%`,
                              }}
                            />

                          </div>

                        </div>

                        <div className="mt-5 pt-4 border-t border-slate-100">

                          {guardado >=
                          planejamento.meta ? (
                            <p className="text-blue-600 font-semibold">
                              🎉 Meta atingida!
                            </p>
                          ) : (
                            <p className="text-slate-600">
                              Faltam{" "}
                              <strong>
                                {formatarMoeda(
                                  falta
                                )}
                              </strong>
                            </p>
                          )}

                        </div>

                      </div>
                    );
                  }
                )
              )}

            </div>

          </>
        )}

        {/* ITENS DA CASA */}

        {abaAtiva ===
          "itens" && (
          <>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-6 sm:mb-8">

              <div>

                <p className="text-slate-500">
                  Planejamento da mudança
                </p>

                <h2 className="text-3xl md:text-4xl font-bold mt-2">
                  🏠 Itens da casa
                </h2>

                <p className="text-slate-500 mt-2">
                  Total estimado:{" "}
                  <strong>
                    {formatarMoeda(
                      totalItens
                    )}
                  </strong>
                </p>

              </div>

              <button
                onClick={() => {
                  setTipoNovoItem(
                    "Casa"
                  );

                  setTemaItem("");

                  setModalItem(
                    true
                  );
                }}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl"
              >
                + Adicionar
              </button>

            </div>

            {itensGrandes.length ===
            0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-8 text-center">

                <div className="text-5xl">
                  🏠
                </div>

                <h3 className="text-xl font-bold mt-4">
                  Nenhum item cadastrado
                </h3>

              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">

                {itensGrandes.map(
                  (item) => (
                    <CardItem
                      key={item.id}
                      item={item}
                      formatarMoeda={
                        formatarMoeda
                      }
                      editar={
                        abrirEdicaoItem
                      }
                      excluir={
                        setItemParaExcluir
                      }
                    />
                  )
                )}

              </div>
            )}

          </>
        )}

        {/* FINANÇAS */}

        {abaAtiva === "financas" && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-6">
              <div>
                <p className="text-slate-500">Organizem o dinheiro de vocês em um só lugar</p>
                <h2 className="text-3xl md:text-4xl font-bold mt-2">💵 Finanças</h2>
                <p className="text-slate-500 mt-2 max-w-2xl">
                  Salários, gastos, dívidas, parcelas, categorias e vencimentos com cálculos automáticos.
                </p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-2 flex gap-2 overflow-x-auto mb-6">
              {[
                ["casal", "Casal"],
                ["julia", "Júlia"],
                ["paulo", "Paulo"],
              ].map(([id, nome]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setAbaFinancas(id as "casal" | "julia" | "paulo")}
                  className={`flex-1 min-w-[110px] px-4 py-3 rounded-xl font-semibold transition ${
                    abaFinancas === id
                      ? "bg-emerald-500 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {nome}
                </button>
              ))}
            </div>

            {(() => {
              const pessoa = pessoaFinanceiraAtual();
              const lancamentos = lancamentosDaAbaFinanceira();
              const dividas = dividasDaAbaFinanceira();
              const parcelas = parcelasDaAbaFinanceira();
              const mesAtual = `${anoFinanceiro}-${String(mesFinanceiro + 1).padStart(2, "0")}`;
              // Lançamentos comuns ficam restritos ao mês selecionado.
              // Dívidas e parcelas continuam persistindo conforme seus vencimentos.
              const lancamentosDoMes = lancamentos.filter((item) =>
                item.data.startsWith(mesAtual)
              );
              const salariosMes = lancamentos
                .filter((item) => item.tipo === "salario" && item.data.startsWith(mesAtual))
                .reduce((soma, item) => soma + Number(item.valor || 0), 0);
              const ganhosAdicionaisMes = lancamentos
                .filter((item) => item.tipo === "ganho_adicional" && item.data.startsWith(mesAtual))
                .reduce((soma, item) => soma + Number(item.valor || 0), 0);
              const gastosMes = lancamentos
                .filter((item) => item.tipo === "gasto" && item.data.startsWith(mesAtual))
                .reduce((soma, item) => soma + Number(item.valor || 0), 0);
              const parcelasMes = parcelas
                .filter((parcela) => !parcela.paga && parcela.vencimento.startsWith(mesAtual))
                .reduce((soma, parcela) => soma + Number(parcela.valor || 0), 0);
              const disponivel = salariosMes + ganhosAdicionaisMes - gastosMes - parcelasMes;
              const parcelasPendentes = parcelas.filter((parcela) => !parcela.paga);
              const categorias = categoriasDaAbaFinanceira();
              const inicioMes = new Date(anoFinanceiro, mesFinanceiro, 1);
              const primeiroDiaSemana = inicioMes.getDay();
              const diasNoMes = new Date(anoFinanceiro, mesFinanceiro + 1, 0).getDate();
              const parcelasDoMes = parcelas.filter((parcela) => parcela.vencimento.startsWith(mesAtual));
              const gastosDoMes = lancamentos.filter((item) => item.tipo === "gasto" && item.data.startsWith(mesAtual));
              const ganhosAdicionaisDoMes = lancamentos.filter((item) => item.tipo === "ganho_adicional" && item.data.startsWith(mesAtual));

              return (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                    <ResumoFinanceiroCard titulo="Salário" valor={formatarMoeda(salariosMes)} icone="💵" />
                    <ResumoFinanceiroCard titulo="Ganhos adicionais" valor={formatarMoeda(ganhosAdicionaisMes)} icone="➕" />
                    <ResumoFinanceiroCard titulo="Gastos" valor={formatarMoeda(gastosMes)} icone="📤" />
                    <ResumoFinanceiroCard titulo="Parcelas" valor={formatarMoeda(parcelasMes)} icone="💳" />
                    <ResumoFinanceiroCard titulo="Disponível" valor={formatarMoeda(disponivel)} icone="💰" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                    <button type="button" onClick={() => abrirNovoLancamentoFinanceiro("salario")} className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-2xl font-semibold">+ 💵 Salário</button>
                    <button type="button" onClick={() => abrirNovoLancamentoFinanceiro("ganho_adicional")} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-2xl font-semibold">+ ➕ Ganho adicional</button>
                    <button type="button" onClick={() => abrirNovoLancamentoFinanceiro("gasto")} className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-3 rounded-2xl font-semibold">+ 📤 Gasto</button>
                    <button type="button" onClick={abrirNovaDividaFinanceira} className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-3 rounded-2xl font-semibold">+ 💳 Dívida</button>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <section className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden">
                      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Calendário financeiro</p>
                          <h3 className="text-2xl font-bold mt-1">{nomeDoMes(mesFinanceiro + 1)} de {anoFinanceiro}</h3>
                        </div>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => deslocarMesFinanceiro(-1)} className="w-10 h-10 rounded-xl border border-slate-200 hover:bg-slate-50">←</button>
                          <button type="button" onClick={() => { setMesFinanceiro(new Date().getMonth()); setAnoFinanceiro(new Date().getFullYear()); }} className="px-3 h-10 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm">Hoje</button>
                          <button type="button" onClick={() => deslocarMesFinanceiro(1)} className="w-10 h-10 rounded-xl border border-slate-200 hover:bg-slate-50">→</button>
                        </div>
                      </div>

                      <div className="p-2 sm:p-5">
                        <div className="grid grid-cols-7 text-center text-[10px] sm:text-xs font-semibold text-slate-400 mb-1 sm:mb-2">
                          {["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"].map((dia) => <div key={dia} className="py-1.5 sm:py-2">{dia}</div>)}
                        </div>
                        <div className="grid grid-cols-7 gap-1 sm:gap-2">
                          {Array.from({ length: primeiroDiaSemana }).map((_, index) => <div key={`vazio-${index}`} className="min-h-[64px] sm:min-h-24" />)}
                          {Array.from({ length: diasNoMes }, (_, index) => {
                            const dia = index + 1;
                            const dataDia = `${anoFinanceiro}-${String(mesFinanceiro + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
                            const parcelasDia = parcelasDoMes.filter((parcela) => parcela.vencimento === dataDia);
                            const gastosDia = gastosDoMes.filter((item) => item.data === dataDia);
                            const ganhosDia = ganhosAdicionaisDoMes.filter((item) => item.data === dataDia);
                            const hoje = dataLocalString() === dataDia;
                            return (
                              <div key={dataDia} className={`min-h-[64px] sm:min-h-24 border rounded-lg sm:rounded-xl p-1 sm:p-2 overflow-hidden ${hoje ? "border-emerald-400 bg-emerald-50/40" : "border-slate-100"}`}>
                                <div className={`text-[10px] sm:text-xs font-bold ${hoje ? "text-emerald-600" : "text-slate-500"}`}>{dia}</div>
                                <div className="mt-1 space-y-0.5 sm:space-y-1 min-w-0">
                                  {parcelasDia.slice(0, 2).map((parcela) => {
                                    const divida = dividasFinanceiras.find((item) => item.id === parcela.divida_id);
                                    return <button type="button" key={parcela.id} onClick={() => alternarParcelaFinanceira(parcela)} className={`w-full min-w-0 overflow-hidden text-left text-[8px] sm:text-xs rounded-md sm:rounded-lg px-1 py-0.5 sm:px-1.5 sm:py-1 ${parcela.paga ? "bg-emerald-100 text-emerald-700 line-through" : "bg-pink-50 text-pink-700"}`}><span className="block truncate">💳 {divida?.nome || "Parcela"}</span><span className="block truncate">{formatarMoeda(parcela.valor)}</span></button>;
                                  })}
                                  {gastosDia.slice(0, 1).map((gasto) => <button type="button" key={gasto.id} onClick={() => abrirEdicaoLancamentoFinanceiro(gasto)} className="w-full min-w-0 overflow-hidden text-left text-[8px] sm:text-xs rounded-md sm:rounded-lg px-1 py-0.5 sm:px-1.5 sm:py-1 bg-slate-100 text-slate-700 truncate">📤 {formatarMoeda(gasto.valor)}</button>)}
                                  {ganhosDia.slice(0, 1).map((ganho) => <button type="button" key={ganho.id} onClick={() => abrirEdicaoLancamentoFinanceiro(ganho)} className="w-full min-w-0 overflow-hidden text-left text-[8px] sm:text-xs rounded-md sm:rounded-lg px-1 py-0.5 sm:px-1.5 sm:py-1 bg-blue-50 text-blue-700 truncate">➕ {formatarMoeda(ganho.valor)}</button>)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </section>

                    <section className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden">
                      <div className="p-5 border-b border-slate-100">
                        <h3 className="text-xl font-bold">💳 Dívidas</h3>
                        <p className="text-sm text-slate-500 mt-1">{dividas.filter((d) => d.status !== "quitada").length} em andamento • {dividas.filter((d) => d.status === "quitada").length} quitada(s)</p>
                      </div>
                      <div className="p-4 space-y-3 max-h-[520px] overflow-y-auto">
                        {dividas.length === 0 ? (
                          <div className="py-10 text-center text-slate-500">Nenhuma dívida cadastrada.</div>
                        ) : dividas.map((divida) => {
                          const parcelasDaDivida = parcelas.filter((p) => p.divida_id === divida.id);
                          const pagas = parcelasDaDivida.filter((p) => p.paga).length;
                          const quitada = pagas >= divida.parcelas_total;
                          const restante = parcelasDaDivida.filter((p) => !p.paga).reduce((soma, p) => soma + Number(p.valor || 0), 0);
                          return (
                            <div key={divida.id} className={`border rounded-2xl p-4 ${quitada ? "border-emerald-200 bg-emerald-50/50" : "border-slate-200"}`}>
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <h4 className="font-bold text-slate-800 break-words">{categorias.find((c) => c.nome === divida.categoria)?.emoji || "💳"} {divida.nome}</h4>
                                  <p className="text-sm text-slate-500 mt-1">{pagas}/{divida.parcelas_total} parcelas {quitada ? "• ✅ Quitada" : `• ${formatarMoeda(restante)} restante`}</p>
                                </div>
                                <div className="flex gap-1">
                                  <button type="button" onClick={() => abrirEdicaoDividaFinanceira(divida)} className="w-9 h-9 rounded-lg hover:bg-slate-100">✏️</button>
                                  <button type="button" onClick={() => excluirDividaFinanceira(divida)} className="w-9 h-9 rounded-lg hover:bg-red-50">🗑️</button>
                                </div>
                              </div>
                              <div className="mt-3 flex items-center justify-between text-sm">
                                <span className="text-slate-500">{formatarMoeda(divida.valor_parcela)}/mês</span>
                                <span className="font-semibold text-slate-700">{formatarMoeda(divida.valor_total)}</span>
                              </div>
                              <div className="mt-3 space-y-1">
                                {parcelasDaDivida.slice(0, 12).map((parcela) => (
                                  <div key={parcela.id} className="flex items-center gap-2">
                                    <button type="button" onClick={() => alternarParcelaFinanceira(parcela)} className={`flex-1 text-left text-xs px-2 py-1.5 rounded-lg ${parcela.paga ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-600"}`}>
                                      {parcela.paga ? "☑" : "☐"} {parcela.numero}/{divida.parcelas_total} — {formatarMoeda(parcela.valor)} — {formatarDataCurta(parcela.vencimento)}
                                    </button>
                                    <button type="button" onClick={() => abrirEdicaoParcelaFinanceira(parcela)} className="w-8 h-8 rounded-lg hover:bg-slate-100" title="Editar valor da parcela">✏️</button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  </div>

                  <section className="mt-6 bg-white border border-slate-200 rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden">
                    <button type="button" onClick={() => setLancamentosFinanceirosAbertos((aberto) => !aberto)} className="w-full p-5 sm:p-6 flex items-center justify-between gap-3 text-left hover:bg-slate-50 transition">
                      <div>
                        <h3 className="text-xl font-bold">📊 Lançamentos de {nomePessoaFinanceira(pessoa)}</h3>
                        <p className="text-sm text-slate-500 mt-1">{lancamentosDoMes.length} lançamento(s) em {nomeDoMes(mesFinanceiro + 1)} • clique para {lancamentosFinanceirosAbertos ? "recolher" : "ver a lista"}.</p>
                      </div>
                      <span className="text-2xl text-slate-400">{lancamentosFinanceirosAbertos ? "⌃" : "⌄"}</span>
                    </button>
                    {lancamentosFinanceirosAbertos && (
                      <div className="border-t border-slate-100 divide-y divide-slate-100">
                        {lancamentosDoMes.length === 0 ? (
                          <div className="p-8 text-center text-slate-500">Nenhum lançamento cadastrado neste mês.</div>
                        ) : lancamentosDoMes.slice(0, 30).map((item) => (
                          <div key={item.id} className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-xl">{item.tipo === "salario" ? "💵" : item.tipo === "ganho_adicional" ? "➕" : "📤"}</div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-slate-800 truncate">{item.descricao}</p>
                              <p className="text-xs text-slate-500">{formatarDataCurta(item.data)} {item.categoria ? `• ${item.categoria}` : ""}</p>
                            </div>
                            <strong className={item.tipo === "gasto" ? "text-slate-700" : "text-emerald-600"}>{formatarMoeda(item.valor)}</strong>
                            <button type="button" onClick={() => abrirEdicaoLancamentoFinanceiro(item)} className="w-9 h-9 rounded-lg hover:bg-slate-100">✏️</button>
                            <button type="button" onClick={() => excluirLancamentoFinanceiro(item)} className="w-9 h-9 rounded-lg hover:bg-red-50">🗑️</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  <section className="mt-6 bg-white border border-slate-200 rounded-2xl sm:rounded-3xl overflow-hidden">
                    <button type="button" onClick={() => setCategoriasFinanceirasAbertas((aberto) => !aberto)} className="w-full p-5 sm:p-6 flex items-center justify-between gap-3 text-left hover:bg-slate-50 transition">
                      <div>
                        <h3 className="text-xl font-bold">🏷️ Categorias</h3>
                        <p className="text-sm text-slate-500 mt-1">{categorias.length} categoria(s) • personalize com nome e emoji.</p>
                      </div>
                      <span className="text-2xl text-slate-400">{categoriasFinanceirasAbertas ? "⌃" : "⌄"}</span>
                    </button>
                    {categoriasFinanceirasAbertas && (
                      <div className="border-t border-slate-100 p-5 sm:p-6">
                        <div className="flex justify-end mb-4">
                          <button type="button" onClick={abrirNovaCategoriaFinanceira} className="bg-slate-800 text-white px-4 py-2.5 rounded-xl font-medium">+ Nova</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {categorias.map((categoria) => (
                            <div key={categoria.id} className="inline-flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50">
                              <span>{categoria.emoji}</span><span className="text-sm font-medium">{categoria.nome}</span>
                              <button type="button" onClick={() => abrirEdicaoCategoriaFinanceira(categoria)} className="text-xs">✏️</button>
                              <button type="button" onClick={() => excluirCategoriaFinanceira(categoria)} className="text-xs">🗑️</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </section>
                </>
              );
            })()}
          </>
        )}

        {/* NOSSA AGENDA */}

        {abaAtiva === "agenda" && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-6 sm:mb-8">
              <div>
                <p className="text-slate-500">Momentos, compromissos e planos de vocês</p>
                <h2 className="text-3xl md:text-4xl font-bold mt-2">
                  ❤️ Nossa Agenda
                </h2>
                <p className="text-slate-500 mt-2 max-w-2xl">
                  Organize o que vocês querem viver, lembrar ou resolver juntos.
                  Eventos mensais e anuais aparecem automaticamente nas próximas datas.
                </p>
              </div>

              <button
                type="button"
                onClick={() => abrirNovoEvento()}
                className="w-full sm:w-auto shrink-0 bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-2xl font-semibold shadow-sm"
              >
                + Nova programação
              </button>
            </div>

            <section className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                    Calendário
                  </p>
                  <h3 className="text-2xl font-bold mt-1">
                    {nomeDoMes(mesAgenda + 1)} de {anoAgenda}
                  </h3>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => mudarMesAgenda(-1)}
                    className="w-11 h-11 rounded-xl border border-slate-200 hover:bg-slate-50 font-semibold"
                    aria-label="Mês anterior"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const agora = new Date();
                      setMesAgenda(agora.getMonth());
                      setAnoAgenda(agora.getFullYear());
                    }}
                    className="px-4 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-sm font-semibold"
                  >
                    Hoje
                  </button>
                  <button
                    type="button"
                    onClick={() => mudarMesAgenda(1)}
                    className="w-11 h-11 rounded-xl border border-slate-200 hover:bg-slate-50 font-semibold"
                    aria-label="Próximo mês"
                  >
                    →
                  </button>
                </div>
              </div>

              <div className="w-full overflow-hidden">
                <div className="w-full p-1.5 sm:p-5">
                  <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-1 sm:mb-2">
                    {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((diaSemana) => (
                      <div
                        key={diaSemana}
                        className="min-w-0 text-center text-[10px] sm:text-sm font-semibold text-slate-500 py-1.5 sm:py-2"
                      >
                        {diaSemana}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1 sm:gap-2">
                    {Array.from(
                      {
                        length: new Date(anoAgenda, mesAgenda, 1).getDay(),
                      },
                      (_, index) => (
                        <div
                          key={`vazio-${index}`}
                          className="min-w-0 min-h-[64px] sm:min-h-[112px] rounded-lg sm:rounded-2xl bg-slate-50/60 border border-transparent"
                        />
                      )
                    )}

                    {Array.from(
                      { length: diasNoMes(anoAgenda, mesAgenda) },
                      (_, index) => {
                        const dia = index + 1;
                        const eventos = eventosDoDia(dia);
                        const hojeCalendario =
                          dia === hoje.getDate() &&
                          mesAgenda === hoje.getMonth() &&
                          anoAgenda === hoje.getFullYear();

                        return (
                          <div
                            key={dia}
                            role="button"
                            tabIndex={0}
                            onClick={() =>
                              abrirNovoEvento(
                                dataLocalString(
                                  new Date(anoAgenda, mesAgenda, dia)
                                )
                              )
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                abrirNovoEvento(
                                  dataLocalString(
                                    new Date(anoAgenda, mesAgenda, dia)
                                  )
                                );
                              }
                            }}
                            className={`min-w-0 min-h-[64px] sm:min-h-[112px] cursor-pointer text-left rounded-lg sm:rounded-2xl border p-1 sm:p-3 overflow-hidden transition hover:shadow-sm hover:border-pink-200 ${
                              hojeCalendario
                                ? "border-pink-300 bg-pink-50/40"
                                : "border-slate-200 bg-white"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 min-w-0">
                              <span
                                className={`w-6 h-6 sm:w-8 sm:h-8 shrink-0 rounded-full flex items-center justify-center text-[10px] sm:text-sm font-bold ${
                                  hojeCalendario
                                    ? "bg-pink-500 text-white"
                                    : "text-slate-700"
                                }`}
                              >
                                {dia}
                              </span>
                              {eventos.length > 0 && (
                                <span className="min-w-0 truncate text-[8px] sm:text-[10px] text-pink-500 font-semibold">
                                  {eventos.length} {eventos.length === 1 ? "evento" : "eventos"}
                                </span>
                              )}
                            </div>

                            <div className="space-y-0.5 sm:space-y-1 mt-1 sm:mt-2 min-w-0">
                              {eventos.slice(0, 3).map((evento) => (
                                <div
                                  key={evento.id}
                                  onClick={(e) => e.stopPropagation()}
                                  className={`min-w-0 overflow-hidden rounded-md sm:rounded-lg px-1 py-0.5 sm:px-2 sm:py-1.5 border ${
                                    evento.concluido
                                      ? "bg-slate-50 border-slate-200"
                                      : "bg-pink-50 border-pink-100"
                                  }`}
                                >
                                  <button
                                    type="button"
                                    onClick={() => abrirEdicaoEvento(evento)}
                                    className="w-full min-w-0 text-left overflow-hidden"
                                  >
                                    <p
                                      className={`text-[8px] sm:text-xs leading-tight font-semibold truncate ${
                                        evento.concluido
                                          ? "line-through text-slate-400"
                                          : "text-slate-700"
                                      }`}
                                    >
                                      {evento.concluido ? "✓ " : ""}
                                      {emojiDoEvento(evento)} {evento.titulo}
                                    </p>
                                    {evento.horario && (
                                      <p className="text-[7px] sm:text-[10px] text-slate-500 mt-0.5 truncate">
                                        {evento.horario}
                                      </p>
                                    )}
                                  </button>
                                </div>
                              ))}

                              {eventos.length > 3 && (
                                <p className="text-[10px] text-slate-400 px-1">
                                  + {eventos.length - 3} programação(ões)
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-5 sm:p-7 mt-5 sm:mt-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold">📋 Programações deste mês</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Clique em uma programação para editar.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {Array.from(
                  { length: diasNoMes(anoAgenda, mesAgenda) },
                  (_, index) => index + 1
                ).flatMap((dia) =>
                  eventosDoDia(dia).map((evento) => ({ dia, evento }))
                ).length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
                    <div className="text-4xl">📅</div>
                    <p className="font-semibold text-slate-700 mt-3">
                      Nenhuma programação neste mês.
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      Adicione um momento especial para vocês.
                    </p>
                  </div>
                ) : (
                  Array.from(
                    { length: diasNoMes(anoAgenda, mesAgenda) },
                    (_, index) => index + 1
                  ).flatMap((dia) =>
                    eventosDoDia(dia).map((evento) => ({ dia, evento }))
                  ).map(({ dia, evento }) => (
                    <div
                      key={`${evento.id}-${dia}`}
                      className="border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                    >
                      <button
                        type="button"
                        onClick={() => abrirEdicaoEvento(evento)}
                        className="min-w-0 text-left"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-pink-500 bg-pink-50 px-2.5 py-1 rounded-full">
                            {String(dia).padStart(2, "0")}/{String(mesAgenda + 1).padStart(2, "0")}
                          </span>
                          {evento.recorrencia === "mensal" && (
                            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                              ↻ Todo mês
                            </span>
                          )}
                          {evento.recorrencia === "anual" && (
                            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                              ↻ Todo ano
                            </span>
                          )}
                        </div>

                        <h4
                          className={`text-lg font-bold mt-3 break-words ${
                            evento.concluido
                              ? "line-through text-slate-400"
                              : "text-slate-800"
                          }`}
                        >
                          {evento.concluido ? "✓ " : `${emojiDoEvento(evento)} `}
                          {evento.titulo}
                        </h4>

                        <p className="text-sm text-slate-500 mt-1">
                          {evento.categoria || "Outros"}
                          {evento.horario ? ` • ${evento.horario}` : ""}
                        </p>

                        {evento.descricao && (
                          <p className="text-sm text-slate-500 mt-2 break-words">
                            📝 {evento.descricao}
                          </p>
                        )}

                        {evento.recorrencia !== "nenhuma" && (
                          <p className="text-xs text-slate-400 mt-2">
                            Data cadastrada: {formatarDataAgenda(evento.data)}
                          </p>
                        )}
                      </button>

                      <div className="flex gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => alternarConcluidoEvento(evento)}
                          className="w-11 h-11 rounded-xl bg-blue-50 hover:bg-blue-100"
                          aria-label={
                            evento.concluido
                              ? "Reabrir programação"
                              : "Marcar como concluída"
                          }
                        >
                          {evento.concluido ? "↩️" : "✅"}
                        </button>
                        <button
                          type="button"
                          onClick={() => abrirEdicaoEvento(evento)}
                          className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200"
                          aria-label="Editar programação"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          onClick={() => excluirEventoAgenda(evento)}
                          className="w-11 h-11 rounded-xl bg-red-500 hover:bg-red-600 text-white"
                          aria-label="Excluir programação"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </>
        )}

        {/* ENXOVAL */}

        {abaAtiva ===
          "enxoval" && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-6 sm:mb-8">
              <div>
                <p className="text-slate-500">
                  Preparativos para a mudança
                </p>
                <h2 className="text-3xl md:text-4xl font-bold mt-2">
                  🧺 Nosso enxoval
                </h2>
                <p className="text-slate-500 mt-2">
                  Organizado por temas, como uma planilha, para facilitar nosso planejamento.
                </p>
              </div>

              <button
                onClick={() => {
                  setTipoNovoItem("Enxoval");
                  setTemaItem("Cozinha");
                  setImagemItem("");
                  setModalItem(true);
                }}
                className="w-full sm:w-auto bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-2xl"
              >
                + Adicionar item
              </button>
            </div>

            <div className="bg-white border border-pink-100 rounded-2xl sm:rounded-3xl p-5 sm:p-6 mb-6 sm:mb-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-slate-500">💰 Valor estimado total do enxoval</p>
                  <h3 className="text-2xl sm:text-3xl font-bold text-pink-500 mt-2 break-words">
                    {formatarMoeda(totalEnxoval)}
                  </h3>
                </div>
                <div className="text-sm text-slate-500">
                  <strong className="text-slate-700">{itensEnxoval.length}</strong> item(ns) •{" "}
                  <strong className="text-blue-600">
                    {itensEnxoval.filter((item) => item.comprado).length}
                  </strong>{" "}
                  comprado(s) •{" "}
                  <strong className="text-slate-700">
                    {itensEnxoval.filter((item) => !item.comprado).length}
                  </strong>{" "}
                  faltando
                </div>
              </div>
            </div>

            {temaEnxovalSelecionado ? (
              (() => {
                const tema = temaEnxovalSelecionado;
                const itensDoTema = itensEnxoval.filter(
                  (item) => (item.tema || "Outros") === tema
                );
                const totalTema = itensDoTema.reduce(
                  (acumulado, item) => acumulado + valorDoItem(item),
                  0
                );
                const compradosTema = itensDoTema.filter(
                  (item) => item.comprado
                ).length;

                return (
                  <section className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden">
                    <div className="p-4 sm:p-6 border-b border-slate-100">
                      <button
                        type="button"
                        onClick={() => setTemaEnxovalSelecionado(null)}
                        className="inline-flex items-center gap-2 text-slate-600 hover:text-pink-500 font-medium mb-5 transition"
                      >
                        <span className="text-xl">←</span>
                        Voltar para categorias
                      </button>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-14 h-14 shrink-0 rounded-2xl bg-pink-50 flex items-center justify-center text-3xl">
                            {EMOJIS_TEMAS_ENXOVAL[tema] || "📦"}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-2xl sm:text-3xl font-bold text-slate-800">
                              {formatarTemaEnxoval(tema)}
                            </h3>
                            <p className="text-slate-500 text-sm mt-1">
                              {itensDoTema.length} item(ns) • {""}
                              <span className="text-blue-600 font-medium">
                                {compradosTema} comprado(s)
                              </span>{" "}
                              • {itensDoTema.length - compradosTema} faltando
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4">
                          <strong className="text-pink-500 text-lg">
                            {formatarMoeda(totalTema)}
                          </strong>
                          <button
                            type="button"
                            onClick={() => {
                              setTipoNovoItem("Enxoval");
                              setTemaItem(tema);
                              setImagemItem("");
                              setModalItem(true);
                            }}
                            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2.5 rounded-xl font-medium transition"
                          >
                            + Adicionar
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 sm:p-6 bg-slate-50/50">
                      {itensDoTema.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                          {itensDoTema.map((item) => (
                            <CardItem
                              key={item.id}
                              item={item}
                              formatarMoeda={formatarMoeda}
                              editar={abrirEdicaoItem}
                              excluir={setItemParaExcluir}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="py-12 text-center">
                          <div className="text-5xl">{EMOJIS_TEMAS_ENXOVAL[tema] || "📦"}</div>
                          <h4 className="text-lg font-bold text-slate-800 mt-4">
                            Nenhum item nesta categoria
                          </h4>
                          <p className="text-slate-500 mt-1">
                            Adicione o primeiro item para começar a montar esta categoria.
                          </p>
                        </div>
                      )}
                    </div>
                  </section>
                );
              })()
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {TEMAS_ENXOVAL.map((tema) => {
                  const itensDoTema = itensEnxoval.filter(
                    (item) => (item.tema || "Outros") === tema
                  );
                  const totalTema = itensDoTema.reduce(
                    (acumulado, item) => acumulado + valorDoItem(item),
                    0
                  );
                  const compradosTema = itensDoTema.filter(
                    (item) => item.comprado
                  ).length;

                  return (
                    <button
                      key={tema}
                      type="button"
                      onClick={() => setTemaEnxovalSelecionado(tema)}
                      className="group w-full text-left bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm hover:border-pink-200 hover:shadow-md transition"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 shrink-0 rounded-2xl bg-pink-50 flex items-center justify-center text-3xl group-hover:scale-105 transition-transform">
                          {EMOJIS_TEMAS_ENXOVAL[tema] || "📦"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <h3 className="text-lg sm:text-xl font-bold text-slate-800">
                              {formatarTemaEnxoval(tema)}
                            </h3>
                            <span className="text-slate-400 group-hover:text-pink-500 text-2xl transition">
                              →
                            </span>
                          </div>
                          <p className="text-slate-500 text-sm mt-1">
                            {itensDoTema.length} item(ns) • {""}
                            <span className="text-blue-600 font-medium">
                              {compradosTema} comprado(s)
                            </span>{" "}
                            • {itensDoTema.length - compradosTema} faltando
                          </p>
                          <p className="text-pink-500 font-semibold mt-2">
                            {formatarMoeda(totalTema)}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {itensEnxoval.length === 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-8 sm:p-10 text-center">
                <div className="text-6xl">🧺</div>
                <h3 className="text-xl font-bold mt-4">
                  Comecem a montar o enxoval!
                </h3>
                <p className="text-slate-500 mt-2">
                  Organize os itens por cozinha, quarto, banheiro, limpeza e muito mais.
                </p>
              </div>
            )}
          </>
        )}

  {/* MODAIS FINANÇAS */}

  {modalFinanceiro === "salario" || modalFinanceiro === "ganho_adicional" || modalFinanceiro === "gasto" ? (
    <Modal>
      <CabecalhoModal
        titulo={`${lancamentoEditando ? "✏️ Editar" : "➕ Novo"} ${modalFinanceiro === "salario" ? "💵 salário" : modalFinanceiro === "ganho_adicional" ? "➕ ganho adicional" : "📤 gasto"}`}
        descricao={`Registre ${modalFinanceiro === "salario" ? "o salário" : modalFinanceiro === "ganho_adicional" ? "um ganho adicional" : "um gasto"} de ${nomePessoaFinanceira(abaFinancas)}.`}
        fechar={() => { setModalFinanceiro(null); setLancamentoEditando(null); }}
      />
      <form onSubmit={salvarLancamentoFinanceiro}>
        <Campo label="Descrição" value={descricaoFinanceira} setValue={setDescricaoFinanceira} />
        <Campo label="Valor" type="number" value={valorFinanceiro} setValue={setValorFinanceiro} />
        <Campo label="Data" type="date" value={dataFinanceira} setValue={setDataFinanceira} />
        <div className="mb-5">
          <label className="block font-medium mb-2 text-slate-700">🏷️ Categoria</label>
          <select value={categoriaFinanceira} onChange={(e) => setCategoriaFinanceira(e.target.value)} className="w-full text-base border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-300">
            <option value="">Sem categoria</option>
            {categoriasDaAbaFinanceira().map((categoria) => <option key={categoria.id} value={categoria.nome}>{categoria.emoji} {categoria.nome}</option>)}
          </select>
        </div>
        <BotaoSalvar carregando={salvandoFinanceiro} texto={lancamentoEditando ? "Salvar alterações" : "Adicionar"} />
      </form>
    </Modal>
  ) : null}

  {modalFinanceiro === "divida" ? (
    <Modal>
      <CabecalhoModal
        titulo={dividaEditando ? "✏️ Editar dívida" : "💳 Nova dívida"}
        descricao="Defina o total, quantidade de parcelas e valor mensal. O calendário é criado automaticamente."
        fechar={() => { setModalFinanceiro(null); setDividaEditando(null); }}
      />
      <form onSubmit={salvarDividaFinanceira}>
        <Campo label="Nome da dívida" value={nomeDividaFinanceira} setValue={setNomeDividaFinanceira} />
        <div className="mb-5">
          <label className="block font-medium mb-2 text-slate-700">Como deseja informar o valor?</label>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setModoValorDivida("total")} className={`px-3 py-2.5 rounded-xl border font-medium ${modoValorDivida === "total" ? "border-pink-500 bg-pink-50 text-pink-700" : "border-slate-200"}`}>Valor total</button>
            <button type="button" onClick={() => setModoValorDivida("mensal")} className={`px-3 py-2.5 rounded-xl border font-medium ${modoValorDivida === "mensal" ? "border-pink-500 bg-pink-50 text-pink-700" : "border-slate-200"}`}>Valor mensal</button>
          </div>
        </div>
        {modoValorDivida === "total" ? (
          <Campo label="Valor total" type="number" value={valorTotalDivida} setValue={(v) => {
            setValorTotalDivida(v);
            if (Number(parcelasDivida) > 0 && !dividaEditando) setValorParcelaDivida((Number(v) / Number(parcelasDivida)).toFixed(2));
          }} />
        ) : (
          <Campo label="💰 Valor mensal" type="number" value={valorParcelaDivida} setValue={(v) => {
            setValorParcelaDivida(v);
            if (Number(parcelasDivida) > 0 && !dividaEditando) setValorTotalDivida((Number(v) * Number(parcelasDivida)).toFixed(2));
          }} />
        )}
        <Campo label="Quantidade de parcelas" type="number" value={parcelasDivida} setValue={(v) => {
          setParcelasDivida(v);
          if (Number(v) > 0 && !dividaEditando) {
            if (modoValorDivida === "total" && Number(valorTotalDivida) > 0) setValorParcelaDivida((Number(valorTotalDivida) / Number(v)).toFixed(2));
            if (modoValorDivida === "mensal" && Number(valorParcelaDivida) > 0) setValorTotalDivida((Number(valorParcelaDivida) * Number(v)).toFixed(2));
          }
        }} />
        {modoValorDivida === "mensal" && <p className="text-sm text-slate-500 -mt-3 mb-5">Total calculado: <strong>{formatarMoeda(Number(valorTotalDivida || 0))}</strong></p>}
        <Campo label="📅 Primeira parcela" type="date" value={dataPrimeiraDivida} setValue={setDataPrimeiraDivida} />
        <div className="mb-5">
          <label className="block font-medium mb-2 text-slate-700">🏷️ Categoria</label>
          <select value={categoriaDivida} onChange={(e) => setCategoriaDivida(e.target.value)} className="w-full text-base border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-pink-300">
            <option value="">Sem categoria</option>
            {categoriasDaAbaFinanceira().map((categoria) => <option key={categoria.id} value={categoria.nome}>{categoria.emoji} {categoria.nome}</option>)}
          </select>
        </div>
        <BotaoSalvar carregando={salvandoFinanceiro} texto={dividaEditando ? "Salvar dívida" : "Criar dívida"} />
      </form>
    </Modal>
  ) : null}

  {modalFinanceiro === "categoria" ? (
    <Modal>
      <CabecalhoModal
        titulo={categoriaEditando ? "✏️ Editar categoria" : "🏷️ Nova categoria"}
        descricao="Escolha um nome e um emoji para organizar suas finanças."
        fechar={() => { setModalFinanceiro(null); setCategoriaEditando(null); }}
      />
      <form onSubmit={salvarCategoriaFinanceira}>
        <Campo label="Nome da categoria" value={nomeCategoriaFinanceira} setValue={setNomeCategoriaFinanceira} />
        <div className="mb-5">
          <label className="block font-medium mb-2 text-slate-700">Emoji</label>
          <div className="grid grid-cols-8 gap-2">
            {EMOJIS_FINANCEIROS.map((emoji) => (
              <button key={emoji} type="button" onClick={() => setEmojiCategoriaFinanceira(emoji)} className={`h-10 rounded-xl border text-xl ${emojiCategoriaFinanceira === emoji ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200" : "border-slate-200 bg-white"}`}>{emoji}</button>
            ))}
          </div>
        </div>
        <BotaoSalvar carregando={false} texto={categoriaEditando ? "Salvar categoria" : "Criar categoria"} />
      </form>
    </Modal>
  ) : null}

  {parcelaEditando && (
    <Modal>
      <CabecalhoModal titulo="✏️ Editar parcela" descricao="Altere somente o valor desta parcela." fechar={() => setParcelaEditando(null)} />
      <form onSubmit={salvarValorParcelaFinanceira}>
        <Campo label={`Parcela ${parcelaEditando.numero}`} type="number" value={valorParcelaEdicao} setValue={setValorParcelaEdicao} />
        <BotaoSalvar carregando={false} texto="Salvar valor" />
      </form>
    </Modal>
  )}

  {/* MODAL NOSSA AGENDA */}

  {modalAgenda && (
    <Modal>
      <CabecalhoModal
        titulo={eventoEditando ? "✏️ Editar programação" : "📅 Nova programação"}
        descricao="Registre algo que vocês querem viver, lembrar ou resolver juntos."
        fechar={() => setModalAgenda(false)}
      />

      <form onSubmit={salvarEventoAgenda}>
        <Campo
          label="Título"
          value={tituloEvento}
          setValue={setTituloEvento}
        />

        <Campo
          label="Data"
          type="date"
          value={dataEvento}
          setValue={setDataEvento}
        />

        <Campo
          label="Horário (opcional)"
          type="time"
          value={horarioEvento}
          setValue={setHorarioEvento}
        />

        <div className="mb-4">
          <label className="block font-medium mb-2 text-slate-700">Categoria</label>
          <select
            value={categoriaEvento}
            onChange={(e) => setCategoriaEvento(e.target.value)}
            className="w-full min-w-0 text-base border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-pink-300"
          >
            <option>Fazer juntos</option>
            <option>Data importante</option>
            <option>Compromisso</option>
            <option>Nossa casa</option>
            <option>Outros</option>
          </select>
        </div>

        <div className="mb-5">
          <label className="block font-medium mb-2 text-slate-700">
            Emoji da programação
          </label>

          <div className="grid grid-cols-8 gap-2">
            {EMOJIS_AGENDA.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setEmojiEvento(emoji)}
                className={`h-11 rounded-xl border text-xl transition ${
                  emojiEvento === emoji
                    ? "border-pink-500 bg-pink-50 ring-2 ring-pink-200"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
                aria-label={`Selecionar emoji ${emoji}`}
                aria-pressed={emojiEvento === emoji}
              >
                {emoji}
              </button>
            ))}
          </div>

          <p className="text-xs text-slate-500 mt-2">
            Escolha o emoji que melhor representa essa programação.
          </p>
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-2 text-slate-700">Repetição</label>
          <select
            value={recorrenciaEvento}
            onChange={(e) => setRecorrenciaEvento(e.target.value)}
            className="w-full min-w-0 text-base border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-pink-300"
          >
            <option value="nenhuma">Não repetir</option>
            <option value="mensal">Todo mês</option>
            <option value="anual">Todo ano</option>
          </select>
        </div>

        <textarea
          value={descricaoEvento}
          onChange={(e) => setDescricaoEvento(e.target.value)}
          placeholder="Observação ou detalhes (opcional)"
          className="w-full min-w-0 text-base border border-slate-200 rounded-xl p-3 mb-5 outline-none focus:ring-2 focus:ring-pink-300"
          rows={4}
        />

        <BotaoSalvar
          carregando={salvandoEvento}
          texto={eventoEditando ? "Salvar alterações" : "Adicionar à agenda"}
        />
      </form>
    </Modal>
  )}

  {/* MODAL NOVO APORTE */}

  {modalAporteAberto && (
    <Modal>

      <CabecalhoModal
        titulo="💰 Novo aporte"
        descricao="Registre um novo valor guardado."
        fechar={() =>
          setModalAporteAberto(
            false
          )
        }
      />

      <form
        onSubmit={
          adicionarAporte
        }
      >

        <CampoSelect
          label="Quem guardou?"
          value={
            pessoaSelecionada
          }
          onChange={
            setPessoaSelecionada
          }
          pessoas={pessoas}
        />

        <Campo
          label="Valor"
          type="number"
          value={valor}
          setValue={setValor}
        />

        <Campo
          label="Data"
          type="date"
          value={data}
          setValue={setData}
        />

        <textarea
          value={observacao}
          onChange={(e) =>
            setObservacao(
              e.target.value
            )
          }
          placeholder="Observação"
          className="w-full min-w-0 border border-slate-200 rounded-xl p-3 mb-5 outline-none focus:ring-2 focus:ring-blue-300 text-base"
        />

        <BotaoSalvar
          carregando={
            salvandoAporte
          }
          texto="Salvar aporte"
        />

      </form>

    </Modal>
  )}

  {/* MODAL META PRINCIPAL */}

  {modalMetaPrincipal && (
    <Modal>

      <CabecalhoModal
        titulo="🎯 Meta principal"
        descricao="Defina o objetivo financeiro principal."
        fechar={() =>
          setModalMetaPrincipal(
            false
          )
        }
      />

      <form
        onSubmit={
          salvarMetaPrincipal
        }
      >

        <Campo
          label="Valor da meta"
          type="number"
          value={
            metaPrincipalEditando
          }
          setValue={
            setMetaPrincipalEditando
          }
        />

        <BotaoSalvar
          carregando={
            salvandoMetaPrincipal
          }
          texto="Salvar meta"
        />

      </form>

    </Modal>
  )}

  {/* MODAL PLANEJAMENTO */}

  {modalPlanejamento && (
    <Modal>

      <CabecalhoModal
        titulo={
          planejamentoEditando
            ? "📅 Editar meta mensal"
            : "📅 Nova meta mensal"
        }
        descricao="Defina a meta para este mês."
        fechar={() =>
          setModalPlanejamento(
            false
          )
        }
      />

      <form
        onSubmit={
          salvarPlanejamento
        }
      >

        <label className="block font-medium mb-2">
          Mês
        </label>

        <select
          value={
            mesPlanejamento
          }
          onChange={(e) =>
            setMesPlanejamento(
              Number(
                e.target.value
              )
            )
          }
          className="w-full text-base border border-slate-200 rounded-xl p-3 mb-4 outline-none focus:ring-2 focus:ring-blue-300"
        >

          {Array.from(
            {
              length: 12,
            },
            (_, index) => (
              <option
                key={index}
                value={
                  index + 1
                }
              >
                {nomeDoMes(
                  index + 1
                )}
              </option>
            )
          )}

        </select>

        <Campo
          label="Ano"
          type="number"
          value={String(
            anoPlanejamento
          )}
          setValue={(valor) =>
            setAnoPlanejamento(
              Number(valor)
            )
          }
        />

        <Campo
          label="Meta mensal"
          type="number"
          value={
            valorMetaMensal
          }
          setValue={
            setValorMetaMensal
          }
        />

        <BotaoSalvar
          carregando={
            salvandoPlanejamento
          }
          texto="Salvar meta mensal"
        />

      </form>

    </Modal>
  )}

  {/* MODAL NOVO ITEM */}

  {modalItem && (
    <Modal>

      <CabecalhoModal
        titulo={
          tipoNovoItem === "Casa"
            ? "🏠 Novo item"
            : "🧺 Novo item do enxoval"
        }
        descricao={
          tipoNovoItem === "Casa"
            ? "Adicione um item para a futura casa."
            : "Organize o enxoval por tema."
        }
        fechar={() =>
          setModalItem(false)
        }
      />

      <form
        onSubmit={
          adicionarItem
        }
      >

        <Campo
          label="Nome"
          value={nomeItem}
          setValue={setNomeItem}
        />

        {tipoNovoItem ===
          "Enxoval" && (
          <div className="mb-4">

            <label className="block font-medium mb-2">
              Tema do enxoval
            </label>

            <select
              value={temaItem}
              onChange={(e) =>
                setTemaItem(
                  e.target.value
                )
              }
              className="w-full text-base border border-slate-200 rounded-xl p-3"
            >

              <option value="">
                Selecione o tema
              </option>

              {TEMAS_ENXOVAL.map(
                (tema) => (
                  <option
                    key={tema}
                    value={tema}
                  >
                    {formatarTemaEnxoval(tema)}
                  </option>
                )
              )}

            </select>

          </div>
        )}

        <Campo
          label="Valor estimado"
          type="number"
          value={valorItem}
          setValue={setValorItem}
        />

        <Campo
          label="Quantidade"
          type="number"
          value={quantidadeItem}
          setValue={
            setQuantidadeItem
          }
        />

        <Campo
          label="Loja"
          value={lojaItem}
          setValue={setLojaItem}
        />

        {tipoNovoItem === "Enxoval" && (
          <div className="mb-5">
            <label className="block font-medium mb-2">Imagem do item</label>
            <label className={`w-full flex items-center justify-center gap-3 border-2 border-dashed rounded-2xl p-5 cursor-pointer transition ${uploadandoImagemItem ? "opacity-60 cursor-wait" : "border-pink-200 hover:border-pink-400 hover:bg-pink-50"}`}>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadandoImagemItem}
                onChange={(e) => enviarImagemItem(e, "novo")}
              />
              <span className="text-2xl">📷</span>
              <span className="font-semibold text-slate-700">
                {uploadandoImagemItem ? "Enviando imagem..." : imagemItem ? "Trocar imagem" : "Adicionar imagem"}
              </span>
            </label>

            {imagemItem && (
              <div className="mt-3 relative rounded-2xl border border-slate-200 bg-slate-50 p-2 overflow-hidden">
                <img
                  src={imagemItem}
                  alt={`Prévia de ${nomeItem || "item"}`}
                  className="w-full h-48 object-contain rounded-xl bg-white"
                />
                <button
                  type="button"
                  onClick={() => setImagemItem("")}
                  className="absolute top-4 right-4 bg-white/95 hover:bg-red-50 text-red-600 px-3 py-2 rounded-xl shadow-sm text-sm font-semibold"
                >
                  Remover
                </button>
              </div>
            )}
          </div>
        )}

        <textarea
          value={
            observacaoItem
          }
          onChange={(e) =>
            setObservacaoItem(
              e.target.value
            )
          }
          placeholder="Observação"
          className="w-full text-base border border-slate-200 rounded-xl p-3 mb-5 outline-none focus:ring-2 focus:ring-blue-300"
        />

        <BotaoSalvar
          carregando={
            salvandoItem
          }
          texto="Adicionar item"
        />

      </form>

    </Modal>
  )}

  {/* MODAL EDITAR ITEM */}

  {itemEditando && (
    <Modal>

      <CabecalhoModal
        titulo="✏️ Editar item"
        descricao="Atualize as informações do item."
        fechar={() =>
          setItemEditando(
            null
          )
        }
      />

      <form
        onSubmit={
          salvarEdicaoItem
        }
      >

        <Campo
          label="Nome"
          value={
            nomeItemEdicao
          }
          setValue={
            setNomeItemEdicao
          }
        />

        {itemEditando.categoria ===
          "Enxoval" && (
          <div className="mb-4">

            <label className="block font-medium mb-2">
              Tema
            </label>

            <select
              value={
                temaItemEdicao
              }
              onChange={(e) =>
                setTemaItemEdicao(
                  e.target.value
                )
              }
              className="w-full text-base border border-slate-200 rounded-xl p-3"
            >

              {TEMAS_ENXOVAL.map(
                (tema) => (
                  <option
                    key={tema}
                    value={tema}
                  >
                    {formatarTemaEnxoval(tema)}
                  </option>
                )
              )}

            </select>

          </div>
        )}

        <Campo
          label="Valor"
          type="number"
          value={
            valorItemEdicao
          }
          setValue={
            setValorItemEdicao
          }
        />

        <Campo
          label="Quantidade"
          type="number"
          value={
            quantidadeItemEdicao
          }
          setValue={
            setQuantidadeItemEdicao
          }
        />

        <Campo
          label="Loja"
          value={
            lojaItemEdicao
          }
          setValue={
            setLojaItemEdicao
          }
        />

        {itemEditando.categoria === "Enxoval" && (
          <div className="mb-5">
            <label className="block font-medium mb-2">Imagem do item</label>
            <label className={`w-full flex items-center justify-center gap-3 border-2 border-dashed rounded-2xl p-5 cursor-pointer transition ${uploadandoImagemItemEdicao ? "opacity-60 cursor-wait" : "border-pink-200 hover:border-pink-400 hover:bg-pink-50"}`}>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadandoImagemItemEdicao}
                onChange={(e) => enviarImagemItem(e, "edicao")}
              />
              <span className="text-2xl">📷</span>
              <span className="font-semibold text-slate-700">
                {uploadandoImagemItemEdicao ? "Enviando imagem..." : imagemItemEdicao ? "Trocar imagem" : "Adicionar imagem"}
              </span>
            </label>

            {imagemItemEdicao && (
              <div className="mt-3 relative rounded-2xl border border-slate-200 bg-slate-50 p-2 overflow-hidden">
                <img
                  src={imagemItemEdicao}
                  alt={`Prévia de ${nomeItemEdicao || "item"}`}
                  className="w-full h-48 object-contain rounded-xl bg-white"
                />
                <button
                  type="button"
                  onClick={() => setImagemItemEdicao("")}
                  className="absolute top-4 right-4 bg-white/95 hover:bg-red-50 text-red-600 px-3 py-2 rounded-xl shadow-sm text-sm font-semibold"
                >
                  Remover
                </button>
              </div>
            )}
          </div>
        )}

        <label className="flex items-center gap-3 mb-5 p-4 bg-slate-50 rounded-xl">

          <input
            type="checkbox"
            checked={
              compradoItemEdicao
            }
            onChange={(e) =>
              setCompradoItemEdicao(
                e.target.checked
              )
            }
            className="w-4 h-4 shrink-0"
          />

          <span className="font-medium">
            Item comprado
          </span>

        </label>

        <textarea
          value={
            observacaoItemEdicao
          }
          onChange={(e) =>
            setObservacaoItemEdicao(
              e.target.value
            )
          }
          placeholder="Observação"
          className="w-full text-base border border-slate-200 rounded-xl p-3 mb-5 outline-none focus:ring-2 focus:ring-blue-300"
        />

        <BotaoSalvar
          carregando={
            salvandoEdicaoItem
          }
          texto="Salvar alterações"
        />

      </form>

    </Modal>
  )}

  {/* MODAL EDITAR APORTE */}

  {aporteEditando && (
    <Modal>

      <CabecalhoModal
        titulo="✏️ Editar aporte"
        descricao="Atualize as informações do aporte."
        fechar={() =>
          setAporteEditando(
            null
          )
        }
      />

      <form
        onSubmit={
          salvarEdicaoAporte
        }
      >

        <Campo
          label="Valor"
          type="number"
          value={
            valorEdicao
          }
          setValue={
            setValorEdicao
          }
        />

        <Campo
          label="Data"
          type="date"
          value={
            dataEdicao
          }
          setValue={
            setDataEdicao
          }
        />

        <textarea
          value={
            observacaoEdicao
          }
          onChange={(e) =>
            setObservacaoEdicao(
              e.target.value
            )
          }
          placeholder="Observação"
          className="w-full text-base border border-slate-200 rounded-xl p-3 mb-5 outline-none focus:ring-2 focus:ring-blue-300"
        />

        <BotaoSalvar
          carregando={
            salvandoEdicaoAporte
          }
          texto="Salvar alterações"
        />

      </form>

    </Modal>
  )}

  {/* MODAL EXCLUIR APORTE */}

  {aporteParaExcluir && (
    <Modal>

      <h2 className="text-xl sm:text-2xl font-bold">
        🗑️ Apagar aporte?
      </h2>

      <p className="text-slate-500 mt-3">
        Esta ação não poderá ser
        desfeita.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mt-6">

        <button
          onClick={() =>
            setAporteParaExcluir(
              null
            )
          }
          className="w-full flex-1 border border-slate-200 py-3 rounded-xl"
        >
          Cancelar
        </button>

        <button
          onClick={
            excluirAporte
          }
          disabled={
            excluindoAporte
          }
          className="w-full flex-1 bg-red-500 text-white py-3 rounded-xl"
        >
          {excluindoAporte
            ? "Apagando..."
            : "Apagar"}
        </button>

      </div>

    </Modal>
  )}

  {/* MODAL EXCLUIR ITEM */}

  {itemParaExcluir && (
    <Modal>

      <h2 className="text-xl sm:text-2xl font-bold">
        🗑️ Apagar item?
      </h2>

      <p className="text-slate-500 mt-3 break-words">
        Deseja apagar{" "}
        <strong>
          {itemParaExcluir.nome}
        </strong>
        ?
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mt-6">

        <button
          onClick={() =>
            setItemParaExcluir(
              null
            )
          }
          className="w-full flex-1 border border-slate-200 py-3 rounded-xl"
        >
          Cancelar
        </button>

        <button
          onClick={
            excluirItem
          }
          disabled={
            excluindoItem
          }
          className="w-full flex-1 bg-red-500 text-white py-3 rounded-xl"
        >
          {excluindoItem
            ? "Apagando..."
            : "Apagar"}
        </button>

      </div>

    </Modal>
  )}

    </div>

  </div>

</div>

</main>

);
}

/* ================================================= */
/* MODAL RESPONSIVO */
/* ================================================= */

function Modal({
children,
}: {
children: React.ReactNode;
}) {
return ( <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">

  <div className="min-h-full w-full flex items-end sm:items-center justify-center">

    <div className="w-full max-w-md max-h-[92vh] overflow-y-auto bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 my-0 sm:my-8">

      {children}

    </div>

  </div>

</div>

);
}

/* ================================================= */
/* CABEÇALHO MODAL */
/* ================================================= */

function CabecalhoModal({
titulo,
descricao,
fechar,
}: {
titulo: string;
descricao: string;
fechar: () => void;
}) {
return ( <div className="flex items-start justify-between gap-3 mb-6">

  <div className="min-w-0">

    <h2 className="text-xl sm:text-2xl font-bold break-words">
      {titulo}
    </h2>

    <p className="text-slate-500 mt-1 break-words">
      {descricao}
    </p>

  </div>

  <button
    type="button"
    onClick={fechar}
    className="shrink-0 w-10 h-10 flex items-center justify-center text-3xl text-slate-400 hover:text-slate-700"
  >
    ×
  </button>

</div>

);
}

/* ================================================= */
/* CAMPO */
/* ================================================= */

function Campo({
label,
value,
setValue,
type = "text",
}: {
label: string;
value: string;
setValue: (
valor: string
) => void;
type?: string;
}) {
return ( <div className="mb-4">

  <label className="block font-medium mb-2 text-slate-700">

    {label}

  </label>

  <input
    type={type}
    step={
      type === "number"
        ? "0.01"
        : undefined
    }
    value={value}
    onChange={(e) =>
      setValue(
        e.target.value
      )
    }
    className="w-full min-w-0 text-base border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
  />

</div>

);
}

/* ================================================= */
/* SELECT PESSOA */
/* ================================================= */

function CampoSelect({
label,
value,
onChange,
pessoas,
}: {
label: string;
value: string;
onChange: (
valor: string
) => void;
pessoas: Pessoa[];
}) {
return ( <div className="mb-4">

  <label className="block font-medium mb-2 text-slate-700">

    {label}

  </label>

  <select
    value={value}
    onChange={(e) =>
      onChange(
        e.target.value
      )
    }
    className="w-full min-w-0 text-base border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-300"
  >

    <option value="">
      Selecione uma pessoa
    </option>

    {pessoas.map(
      (pessoa) => (
        <option
          key={
            pessoa.id
          }
          value={
            pessoa.id
          }
        >
          {pessoa.nome}
        </option>
      )
    )}

  </select>

</div>

);
}

/* ================================================= */
/* BOTÃO SALVAR */
/* ================================================= */

function BotaoSalvar({
carregando,
texto,
}: {
carregando: boolean;
texto: string;
}) {
return ( <button
   disabled={carregando}
   className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3 rounded-xl font-semibold transition"
 >
{carregando
? "Salvando..."
: texto} </button>
);
}

function ResumoFinanceiroCard({
  titulo,
  valor,
  icone,
}: {
  titulo: string;
  valor: string;
  icone: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-xl">{icone}</div>
        <div className="min-w-0">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{titulo}</p>
          <p className="text-lg sm:text-xl font-bold text-slate-800 mt-1 break-words">{valor}</p>
        </div>
      </div>
    </div>
  );
}

/* ================================================= */
/* ================================================= */
/* CARD RESUMO */
/* ================================================= */

function ResumoCard({
titulo,
valor,
icone,
cor,
}: {
titulo: string;
valor: string;
icone: string;
cor: "blue" | "pink";
}) {
const classe =
cor === "pink"
? "border-pink-100 bg-pink-50/30"
: "border-blue-100 bg-blue-50/30";

const corTexto =
cor === "pink"
? "text-pink-500"
: "text-blue-600";

return (
<div
className={`min-w-0 bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border shadow-sm ${classe}`}
>

  <p className="text-slate-500 break-words">
    {icone} {titulo}
  </p>

  <h3
    className={`text-2xl sm:text-3xl font-bold mt-3 break-words ${corTexto}`}
  >
    {valor}
  </h3>

</div>

);
}

/* ================================================= */
/* LINKS CLICÁVEIS NA DESCRIÇÃO */
/* ================================================= */

function renderizarTextoComLinks(texto: string) {
  const partes = texto.split(/(https?:\/\/[^\s]+)/g);

  return partes.map((parte, index) => {
    if (/^https?:\/\//i.test(parte)) {
      const urlLimpa = parte.replace(/[),.;!?]+$/, "");
      const final = parte.slice(urlLimpa.length);

      return (
        <span key={`${urlLimpa}-${index}`}>
          <a
            href={urlLimpa}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline font-medium"
          >
            {urlLimpa}
          </a>
          {final}
        </span>
      );
    }

    return <span key={index}>{parte}</span>;
  });
}

/* ================================================= */
/* CARD ITEM RESPONSIVO */
/* ================================================= */

function CardItem({
  item,
  formatarMoeda,
  editar,
  excluir,
}: {
  item: ItemCasa;
  formatarMoeda: (valor: number) => string;
  editar: (item: ItemCasa) => void;
  excluir: (item: ItemCasa) => void;
}) {
  const valorUnitario = Number(
    item.preco_estimado ??
    item.valor_estimado ??
    0
  );

  const quantidade = Number(item.quantidade || 1);
  const valorTotal = valorUnitario * quantidade;

  return (
    <div
      className={`min-w-0 bg-white border rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm transition hover:shadow-md ${
        item.comprado
          ? "border-blue-200"
          : "border-slate-200"
      }`}
    >
      {item.imagem_url && (
        <div className="w-full aspect-[4/3] max-h-56 bg-slate-50 border-b border-slate-100 overflow-hidden flex items-center justify-center">
          <img
            src={item.imagem_url}
            alt={item.nome}
            className={`w-full h-full object-contain p-2 ${
              item.comprado ? "opacity-60" : ""
            }`}
          />
        </div>
      )}

      <div className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-bold ${
                  item.comprado
                    ? "bg-blue-50 text-blue-600"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {item.comprado
                  ? "🟢 Comprado"
                  : "⚪ Não comprado"}
              </span>
            </div>

            <h3
              className={`text-lg sm:text-xl font-bold break-words ${
                item.comprado
                  ? "line-through text-slate-400"
                  : "text-slate-800"
              }`}
            >
              {item.categoria === "Enxoval" ? "🧺" : "🏠"}{" "}
              {item.nome}
            </h3>

            {item.tema && (
              <p className="text-sm text-pink-500 font-medium mt-2 break-words">
                🏷️ {item.tema}
              </p>
            )}

            {item.loja && (
              <p className="text-sm text-slate-500 mt-2 break-words">
                🏪 {item.loja}
              </p>
            )}

            <p className="text-sm text-slate-500 mt-3">
              Quantidade: <strong>{quantidade}</strong>
            </p>

            <p className="text-blue-600 font-bold text-lg sm:text-xl mt-2 break-words">
              {formatarMoeda(valorTotal)}
            </p>

            {quantidade > 1 && (
              <p className="text-xs text-slate-400 mt-1">
                {formatarMoeda(valorUnitario)} por unidade
              </p>
            )}
          </div>

          <div className="flex gap-2 h-fit shrink-0">
            <button
              onClick={() => editar(item)}
              className="w-11 h-11 shrink-0 bg-blue-50 hover:bg-blue-100 rounded-xl"
              aria-label={`Editar ${item.nome}`}
            >
              ✏️
            </button>

            <button
              onClick={() => excluir(item)}
              className="w-11 h-11 shrink-0 bg-red-500 hover:bg-red-600 text-white rounded-xl"
              aria-label={`Excluir ${item.nome}`}
            >
              🗑️
            </button>
          </div>
        </div>

        {item.observacao && (
          <div className="text-sm text-slate-500 mt-4 pt-4 border-t border-slate-100 break-words">
            <span className="font-medium">📝 </span>
            {renderizarTextoComLinks(item.observacao)}
          </div>
        )}
      </div>
    </div>
  );
}
