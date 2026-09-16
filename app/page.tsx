"use client";

import { FormEvent, useEffect, useState } from "react";
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
created_at?: string;
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

const [
compradoItemEdicao,
setCompradoItemEdicao,
] = useState(false);

const [
salvandoEdicaoItem,
setSalvandoEdicaoItem,
] = useState(false);

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

function abrirNovoEvento(dataSelecionada = dataLocalString()) {
  setEventoEditando(null);
  setTituloEvento("");
  setDataEvento(dataSelecionada);
  setHorarioEvento("");
  setCategoriaEvento("Fazer juntos");
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

function eventoAconteceNoDia(evento: EventoAgenda, dia: number) {
  const dataOriginal = separarDataAgenda(evento.data);
  const recorrencia = normalizarRecorrenciaEvento(evento);

  if (!dataOriginal.dia || !dia) return false;

  // Todo mês: mantém o mesmo dia do mês, independentemente do ano/mês.
  if (recorrencia === "mensal") {
    return dataOriginal.dia === dia;
  }

  // Todo ano: mantém o mesmo dia e mês, independentemente do ano.
  if (recorrencia === "anual") {
    return dataOriginal.dia === dia && dataOriginal.mes === mesAgenda + 1;
  }

  // Evento único: somente na data original.
  return (
    dataOriginal.dia === dia &&
    dataOriginal.mes === mesAgenda + 1 &&
    dataOriginal.ano === anoAgenda
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
                planejamentos.map(
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

        {/* NOSSA AGENDA */}

        {abaAtiva ===
          "agenda" && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-6 sm:mb-8">
              <div className="min-w-0">
                <p className="text-pink-500 font-semibold">
                  Momentos, compromissos e datas especiais
                </p>
                <h2 className="text-3xl md:text-4xl font-bold mt-2 break-words">
                  ❤️ Nossa Agenda
                </h2>
                <p className="text-slate-500 mt-2 max-w-2xl">
                  Organizem o que vocês querem fazer juntos e as datas importantes que não podem esquecer.
                </p>
              </div>

              <button
                type="button"
                onClick={() => abrirNovoEvento()}
                className="w-full sm:w-auto shrink-0 bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-2xl font-semibold shadow-sm"
              >
                + Adicionar programação
              </button>
            </div>

            <section className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-pink-500 font-bold">
                    Calendário
                  </p>
                  <h3 className="text-2xl font-bold mt-1">
                    {nomeDoMes(mesAgenda + 1)} {anoAgenda}
                  </h3>
                </div>

                <div className="flex gap-2">
                  <button type="button" onClick={() => mudarMesAgenda(-1)} className="w-10 h-10 rounded-xl border border-slate-200 hover:bg-slate-50">
                    ←
                  </button>
                  <button type="button" onClick={() => { setMesAgenda(new Date().getMonth()); setAnoAgenda(new Date().getFullYear()); }} className="px-4 h-10 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm font-medium">
                    Hoje
                  </button>
                  <button type="button" onClick={() => mudarMesAgenda(1)} className="w-10 h-10 rounded-xl border border-slate-200 hover:bg-slate-50">
                    →
                  </button>
                </div>
              </div>

              <div className="p-3 sm:p-5 overflow-x-auto">
                <div className="min-w-[620px]">
                  <div className="grid grid-cols-7 mb-2">
                    {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((dia) => (
                      <div key={dia} className="text-center text-xs sm:text-sm font-bold text-slate-400 py-2">
                        {dia}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 border-l border-t border-slate-200 rounded-xl overflow-hidden">
                    {Array.from({ length: new Date(anoAgenda, mesAgenda, 1).getDay() + new Date(anoAgenda, mesAgenda + 1, 0).getDate() }).map((_, indice) => {
                      const primeiroDia = new Date(anoAgenda, mesAgenda, 1).getDay();
                      const dia = indice - primeiroDia + 1;
                      const valido = dia >= 1;
                      const eventos = valido ? eventosDoDia(dia) : [];
                      const hojeAgora = new Date();
                      const ehHoje = valido &&
                        hojeAgora.getDate() === dia &&
                        hojeAgora.getMonth() === mesAgenda &&
                        hojeAgora.getFullYear() === anoAgenda;

                      return (
                        <button
                          type="button"
                          key={indice}
                          disabled={!valido}
                          onClick={() => valido && abrirNovoEvento(`${anoAgenda}-${String(mesAgenda + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`)}
                          className={`min-h-[92px] sm:min-h-[112px] text-left align-top p-2 border-r border-b border-slate-200 transition ${valido ? "bg-white hover:bg-pink-50/40" : "bg-slate-50"}`}
                        >
                          {valido && (
                            <>
                              <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${ehHoje ? "bg-pink-500 text-white" : "text-slate-600"}`}>
                                {dia}
                              </span>

                              <div className="mt-1 space-y-1">
                                {eventos.slice(0, 3).map((evento) => (
                                  <span
                                    key={evento.id}
                                    onClick={(e) => { e.stopPropagation(); abrirEdicaoEvento(evento); }}
                                    className={`block rounded-lg px-2 py-1 text-[11px] leading-tight font-medium truncate ${evento.concluido ? "bg-slate-100 text-slate-400 line-through" : evento.categoria === "Data importante" ? "bg-pink-50 text-pink-600" : "bg-blue-50 text-blue-600"}`}
                                  >
                                    {evento.horario ? `${evento.horario} ` : ""}{evento.titulo}
                                  </span>
                                ))}
                                {eventos.length > 3 && (
                                  <span className="text-[10px] text-slate-400 px-1">+{eventos.length - 3} mais</span>
                                )}
                              </div>
                            </>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-5 sm:mt-6 bg-white border border-slate-200 rounded-2xl sm:rounded-3xl shadow-sm p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-xl font-bold">📌 Próximas programações</h3>
                  <p className="text-sm text-slate-500 mt-1">O que vocês não querem esquecer.</p>
                </div>
                <span className="text-sm text-slate-400">{eventosAgenda.length} cadastrada(s)</span>
              </div>

              {eventosAgenda.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="text-5xl">❤️</div>
                  <p className="font-semibold mt-3">Ainda não há programações.</p>
                  <p className="text-sm text-slate-500 mt-1">Adicionem um passeio, compromisso ou data especial.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {eventosAgenda.slice(0, 10).map((evento) => (
                    <div key={evento.id} className="border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                      <button type="button" onClick={() => alternarConcluidoEvento(evento)} className={`w-11 h-11 rounded-xl shrink-0 ${evento.concluido ? "bg-green-50" : "bg-slate-50"}`}>
                        {evento.concluido ? "✅" : "⭕"}
                      </button>
                      <button type="button" onClick={() => abrirEdicaoEvento(evento)} className="min-w-0 flex-1 text-left">
                        <p className={`font-bold break-words ${evento.concluido ? "text-slate-400 line-through" : "text-slate-800"}`}>
                          {evento.categoria === "Data importante" ? "❤️" : evento.categoria === "Compromisso" ? "📌" : evento.categoria === "Nossa casa" ? "🏠" : "💑"} {evento.titulo}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          📅 {formatarDataAgenda(evento.data)}{evento.horario ? ` • ${evento.horario}` : ""}
                          {evento.recorrencia && evento.recorrencia !== "nenhuma" ? ` • ${evento.recorrencia === "mensal" ? "todo mês" : "todo ano"}` : ""}
                        </p>
                        {evento.descricao && <p className="text-sm text-slate-500 mt-1 break-words">{evento.descricao}</p>}
                      </button>
                      <button type="button" onClick={() => excluirEventoAgenda(evento)} className="w-11 h-11 rounded-xl bg-red-50 text-red-500 shrink-0">
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
                  Preparativos para a
                  mudança
                </p>

                <h2 className="text-3xl md:text-4xl font-bold mt-2">
                  🧺 Nosso enxoval
                </h2>

                <p className="text-slate-500 mt-2">
                  Organizado por temas
                  para facilitar nosso
                  planejamento.
                </p>

              </div>

              <button
                onClick={() => {
                  setTipoNovoItem(
                    "Enxoval"
                  );

                  setTemaItem(
                    "Cozinha"
                  );

                  setModalItem(
                    true
                  );
                }}
                className="w-full sm:w-auto bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-2xl"
              >
                + Adicionar item
              </button>

            </div>

            <div className="bg-white border border-pink-100 rounded-2xl sm:rounded-3xl p-5 sm:p-6 mb-6 sm:mb-8 shadow-sm">

              <p className="text-slate-500">
                💰 Valor estimado total
                do enxoval
              </p>

              <h3 className="text-2xl sm:text-3xl font-bold text-pink-500 mt-2 break-words">
                {formatarMoeda(
                  totalEnxoval
                )}
              </h3>

            </div>

            {TEMAS_ENXOVAL.map(
              (tema) => {
                const itensDoTema =
                  itensEnxoval.filter(
                    (item) =>
                      (item.tema ||
                        "Outros") ===
                      tema
                  );

                if (
                  itensDoTema.length ===
                  0
                ) {
                  return null;
                }

                const totalTema =
                  itensDoTema.reduce(
                    (
                      acumulado,
                      item
                    ) =>
                      acumulado +
                      valorDoItem(
                        item
                      ),
                    0
                  );

                return (
                  <section
                    key={tema}
                    className="mb-8 sm:mb-10"
                  >

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3">

                      <div>

                        <h3 className="text-xl sm:text-2xl font-bold">
                          🧺 {tema}
                        </h3>

                        <p className="text-slate-500 text-sm mt-1">
                          {
                            itensDoTema.length
                          }{" "}
                          item(ns)
                        </p>

                      </div>

                      <strong className="text-pink-500 text-lg sm:text-xl">
                        {formatarMoeda(
                          totalTema
                        )}
                      </strong>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">

                      {itensDoTema.map(
                        (item) => (
                          <CardItem
                            key={
                              item.id
                            }
                            item={
                              item
                            }
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

                  </section>
                );
              }
            )}

            {itensEnxoval.length ===
              0 && (
              <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-8 sm:p-10 text-center">

                <div className="text-6xl">
                  🧺
                </div>

                <h3 className="text-xl font-bold mt-4">
                  Comecem a montar o
                  enxoval!
                </h3>

                <p className="text-slate-500 mt-2">
                  Organize os itens por
                  cozinha, quarto,
                  banheiro, limpeza e
                  muito mais.
                </p>

              </div>
            )}

          </>
        )}

      </div>

    </div>

  </div>

  {/* MODAL NOSSA AGENDA */}

  {modalAgenda && (
    <Modal>
      <CabecalhoModal
        titulo={eventoEditando ? "✏️ Editar programação" : "❤️ Nova programação"}
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
                    {tema}
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
                    {tema}
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
/* CARD ITEM RESPONSIVO */
/* ================================================= */

function CardItem({
item,
formatarMoeda,
editar,
excluir,
}: {
item: ItemCasa;
formatarMoeda: (
valor: number
) => string;
editar: (
item: ItemCasa
) => void;
excluir: (
item: ItemCasa
) => void;
}) {
const valorUnitario =
Number(
item.preco_estimado ??
item.valor_estimado ??
0
);

const quantidade =
Number(
item.quantidade || 1
);

const valorTotal =
valorUnitario *
quantidade;

return (
<div
className={`min-w-0 bg-white border rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm transition hover:shadow-md ${
        item.comprado
          ? "border-blue-200"
          : "border-slate-200"
      }`}
>

  <div className="flex flex-col sm:flex-row sm:justify-between gap-4">

    <div className="min-w-0">

      <h3
        className={`text-lg sm:text-xl font-bold break-words ${
          item.comprado
            ? "line-through text-slate-400"
            : "text-slate-800"
        }`}
      >
        {item.comprado
          ? "✅"
          : item.categoria ===
            "Enxoval"
          ? "🧺"
          : "🏠"}{" "}
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
        Quantidade:{" "}
        <strong>
          {quantidade}
        </strong>
      </p>

      <p className="text-blue-600 font-bold text-lg sm:text-xl mt-2 break-words">
        {formatarMoeda(
          valorTotal
        )}
      </p>

      {quantidade > 1 && (
        <p className="text-xs text-slate-400 mt-1">
          {formatarMoeda(
            valorUnitario
          )} por unidade
        </p>
      )}

    </div>

    <div className="flex gap-2 h-fit shrink-0">

      <button
        onClick={() =>
          editar(item)
        }
        className="w-11 h-11 shrink-0 bg-blue-50 hover:bg-blue-100 rounded-xl"
      >
        ✏️
      </button>

      <button
        onClick={() =>
          excluir(item)
        }
        className="w-11 h-11 shrink-0 bg-red-500 hover:bg-red-600 text-white rounded-xl"
      >
        🗑️
      </button>

    </div>

  </div>

  {item.observacao && (
    <p className="text-sm text-slate-500 mt-4 pt-4 border-t border-slate-100 break-words">
      📝 {item.observacao}
    </p>
  )}

</div>

);
}
