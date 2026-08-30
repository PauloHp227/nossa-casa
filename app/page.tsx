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

type Aba =
  | "visao-geral"
  | "aportes"
  | "planejamento"
  | "itens"
  | "enxoval";

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
  /* ================================================= */
  /* ABA */
  /* ================================================= */

  const [abaAtiva, setAbaAtiva] =
    useState<Aba>("visao-geral");

  /* ================================================= */
  /* DADOS */
  /* ================================================= */

  const [total, setTotal] = useState(0);

  const [meta, setMeta] = useState(9000);

  const [carregando, setCarregando] =
    useState(true);

  const [erro, setErro] =
    useState("");

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

  /* ================================================= */
  /* NOVO APORTE */
  /* ================================================= */

  const [modalAporteAberto, setModalAporteAberto] =
    useState(false);

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

  const [salvandoAporte, setSalvandoAporte] =
    useState(false);

  /* ================================================= */
  /* EDITAR APORTE */
  /* ================================================= */

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

  /* ================================================= */
  /* EXCLUIR APORTE */
  /* ================================================= */

  const [
    aporteParaExcluir,
    setAporteParaExcluir,
  ] = useState<Aporte | null>(null);

  const [
    excluindoAporte,
    setExcluindoAporte,
  ] = useState(false);

  /* ================================================= */
  /* META PRINCIPAL */
  /* ================================================= */

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

  /* ================================================= */
  /* PLANEJAMENTO */
  /* ================================================= */

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

  /* ================================================= */
  /* ITEM NOVO */
  /* ================================================= */

  const [
    modalItem,
    setModalItem,
  ] = useState(false);

  const [
    tipoNovoItem,
    setTipoNovoItem,
  ] = useState<"Casa" | "Enxoval">(
    "Casa"
  );

  const [
    nomeItem,
    setNomeItem,
  ] = useState("");

  const [
    temaItem,
    setTemaItem,
  ] = useState("");

  const [
    valorItem,
    setValorItem,
  ] = useState("");

  const [
    quantidadeItem,
    setQuantidadeItem,
  ] = useState("1");

  const [
    lojaItem,
    setLojaItem,
  ] = useState("");

  const [
    observacaoItem,
    setObservacaoItem,
  ] = useState("");

  const [
    salvandoItem,
    setSalvandoItem,
  ] = useState(false);

  /* ================================================= */
  /* EDITAR ITEM */
  /* ================================================= */

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

  /* ================================================= */
  /* EXCLUIR ITEM */
  /* ================================================= */

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

    setPessoaSelecionada("");
    setValor("");
    setObservacao("");

    setModalAporteAberto(false);
    setSalvandoAporte(false);

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

    setAporteEditando(null);

    setSalvandoEdicaoAporte(false);

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

    setItemEditando(null);

    setSalvandoEdicaoItem(false);

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

    setItemParaExcluir(null);

    setExcluindoItem(false);

    await buscarDados();
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
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-xl text-center">
          <div className="text-5xl animate-bounce">
            🏠
          </div>

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

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      <div className="flex min-h-screen">

        {/* ================================================= */}
        {/* MENU DESKTOP */}
        {/* ================================================= */}

        <aside className="hidden md:flex w-72 bg-white border-r border-slate-200 flex-col p-6 fixed h-screen z-40">

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

          </nav>

          {/* NOSSO PROPÓSITO */}

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

        {/* ================================================= */}
        {/* CONTEÚDO */}
        {/* ================================================= */}

        <div className="flex-1 md:ml-72">

          {/* MENU MOBILE */}

          <div className="md:hidden bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">

            <div className="p-4 flex items-center gap-3">

              <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-pink-400 rounded-xl flex items-center justify-center text-2xl">
                🏠
              </div>

              <div>
                <h1 className="font-bold text-slate-800">
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
              ].map(
                ([id, nome]) => (
                  <button
                    key={id}
                    onClick={() =>
                      setAbaAtiva(
                        id as Aba
                      )
                    }
                    className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium ${
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

          <div className="p-5 md:p-10 max-w-7xl mx-auto">

            {erro && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl">
                {erro}
              </div>
            )}

            {/* ================================================= */}
            {/* VISÃO GERAL */}
            {/* ================================================= */}

            {abaAtiva ===
              "visao-geral" && (
              <>

                <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-10 shadow-sm mb-8">

                  <p className="text-blue-500 font-semibold">
                    Bem-vindos de volta 👋
                  </p>

                  <h2 className="text-3xl md:text-5xl font-bold mt-3 text-slate-800">
                    Construindo nosso
                    <br />
                    futuro juntos 🏠🩷
                  </h2>

                  <p className="text-slate-500 mt-4 max-w-xl">
                    Cada aporte, cada meta
                    e cada item comprado é
                    mais um passo rumo ao
                    nosso sonho.
                  </p>

                </div>

                {/* VERSÍCULO */}

                <div className="bg-gradient-to-r from-blue-50 to-pink-50 border border-blue-100 rounded-3xl p-7 mb-8 text-center">

                  <p className="text-blue-500 font-bold text-sm uppercase tracking-widest">
                    Mateus 19:06
                  </p>

                  <p className="text-slate-700 text-lg md:text-xl italic font-medium mt-3">
                    “Assim, eles já não são
                    dois, mas sim uma só
                    carne. Portanto, o que
                    Deus uniu, ninguém
                    separe.”
                  </p>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                  <ResumoCard
                    titulo="Total guardado"
                    valor={formatarMoeda(
                      total
                    )}
                    icone="💰"
                    cor="blue"
                  />

                  <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">

                    <div className="flex justify-between">

                      <div>

                        <p className="text-slate-500">
                          🎯 Meta principal
                        </p>

                        <h3 className="text-3xl font-bold mt-3">
                          {formatarMoeda(
                            meta
                          )}
                        </h3>

                      </div>

                      <button
                        onClick={() => {
                          setMetaPrincipalEditando(
                            String(meta)
                          );

                          setModalMetaPrincipal(
                            true
                          );
                        }}
                        className="w-11 h-11 rounded-xl bg-blue-50 hover:bg-blue-100"
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

                <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7 mt-6">

                  <div className="flex justify-between items-center">

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

                  <p className="mt-5 text-slate-600">

                    {total >= meta
                      ? `🎉 Vocês ultrapassaram a meta em ${formatarMoeda(
                          excedente
                        )}!`
                      : `Faltam ${formatarMoeda(
                          falta
                        )} para alcançar o objetivo.`}

                  </p>

                </section>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">

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

            {/* ================================================= */}
            {/* APORTES */}
            {/* ================================================= */}

            {abaAtiva ===
              "aportes" && (
              <>

                <div className="flex flex-col md:flex-row justify-between gap-5 mb-8">

                  <div>

                    <p className="text-slate-500">
                      Controle financeiro
                    </p>

                    <h2 className="text-4xl font-bold mt-2">
                      💰 Aportes
                    </h2>

                  </div>

                  <button
                    onClick={() =>
                      setModalAporteAberto(
                        true
                      )
                    }
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-sm"
                  >
                    + Adicionar aporte
                  </button>

                </div>

                <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">

                  <div className="flex justify-between items-center gap-4">

                    <div>

                      <p className="text-slate-500">
                        {nomeDoMes(
                          mesAtual
                        )}{" "}
                        de {anoAtual}
                      </p>

                      <h3 className="text-2xl font-bold mt-1">
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
                      className="border border-blue-200 text-blue-600 px-4 py-2 rounded-xl hover:bg-blue-50"
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

                    <div className="flex justify-between text-sm mb-2">

                      <span>
                        Progresso
                      </span>

                      <strong className="text-blue-600">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">

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
                          className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm"
                        >

                          <h3 className="text-xl font-bold">
                            👤 {pessoa.nome}
                          </h3>

                          <div className="flex justify-between mt-6">

                            <div>

                              <p className="text-sm text-slate-500">
                                Meta
                              </p>

                              <strong>
                                {formatarMoeda(
                                  metaIndividual
                                )}
                              </strong>

                            </div>

                            <div className="text-right">

                              <p className="text-sm text-slate-500">
                                Guardado
                              </p>

                              <strong className="text-blue-600">
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

                <section className="bg-white border border-slate-200 rounded-3xl p-6 mt-8 shadow-sm">

                  <h3 className="text-2xl font-bold">
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
                            className="border border-slate-200 rounded-2xl p-5 flex flex-col md:flex-row justify-between gap-4"
                          >

                            <div>

                              <strong>
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
                                <p className="text-sm text-slate-500 mt-1">
                                  📝{" "}
                                  {
                                    aporte.observacao
                                  }
                                </p>
                              )}

                            </div>

                            <div className="flex gap-2">

                              <button
                                onClick={() =>
                                  abrirEdicaoAporte(
                                    aporte
                                  )
                                }
                                className="w-10 h-10 border border-slate-200 rounded-xl"
                              >
                                ✏️
                              </button>

                              <button
                                onClick={() =>
                                  setAporteParaExcluir(
                                    aporte
                                  )
                                }
                                className="w-10 h-10 bg-red-500 text-white rounded-xl"
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

            {/* ================================================= */}
            {/* PLANEJAMENTO */}
            {/* ================================================= */}

            {abaAtiva ===
              "planejamento" && (
              <>

                <div className="flex flex-col md:flex-row justify-between gap-5 mb-8">

                  <div>

                    <p className="text-slate-500">
                      Organização financeira
                    </p>

                    <h2 className="text-4xl font-bold mt-2">
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
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-semibold"
                  >
                    + Nova meta mensal
                  </button>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

                  {planejamentos.length ===
                  0 ? (
                    <div className="bg-white border border-slate-200 rounded-3xl p-8">

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
                            className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm"
                          >

                            <div className="flex justify-between">

                              <div>

                                <p className="text-blue-500 font-medium">
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
                                className="w-10 h-10 bg-blue-50 rounded-xl"
                              >
                                ✏️
                              </button>

                            </div>

                            <div className="mt-6">

                              <p className="text-sm text-slate-500">
                                Meta mensal
                              </p>

                              <strong className="text-2xl">
                                {formatarMoeda(
                                  planejamento.meta
                                )}
                              </strong>

                            </div>

                            <div className="mt-5">

                              <div className="flex justify-between text-sm">

                                <span>
                                  Guardado
                                </span>

                                <strong>
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

            {/* ================================================= */}
            {/* ITENS DA CASA */}
            {/* ================================================= */}

            {abaAtiva ===
              "itens" && (
              <>

                <div className="flex flex-col md:flex-row justify-between gap-5 mb-8">

                  <div>

                    <p className="text-slate-500">
                      Planejamento da mudança
                    </p>

                    <h2 className="text-4xl font-bold mt-2">
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
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl"
                  >
                    + Adicionar
                  </button>

                </div>

                {itensGrandes.length ===
                0 ? (
                  <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center">

                    <div className="text-5xl">
                      🏠
                    </div>

                    <h3 className="text-xl font-bold mt-4">
                      Nenhum item cadastrado
                    </h3>

                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

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

            {/* ================================================= */}
            {/* ENXOVAL */}
            {/* ================================================= */}

            {abaAtiva ===
              "enxoval" && (
              <>

                <div className="flex flex-col md:flex-row justify-between gap-5 mb-8">

                  <div>

                    <p className="text-slate-500">
                      Preparativos para a
                      mudança
                    </p>

                    <h2 className="text-4xl font-bold mt-2">
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
                    className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-2xl"
                  >
                    + Adicionar item
                  </button>

                </div>

                <div className="bg-white border border-pink-100 rounded-3xl p-6 mb-8 shadow-sm">

                  <p className="text-slate-500">
                    💰 Valor estimado total
                    do enxoval
                  </p>

                  <h3 className="text-3xl font-bold text-pink-500 mt-2">
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
                        className="mb-10"
                      >

                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-5 gap-2">

                          <div>

                            <h3 className="text-2xl font-bold">
                              🧺 {tema}
                            </h3>

                            <p className="text-slate-500 text-sm mt-1">
                              {
                                itensDoTema.length
                              }{" "}
                              item(ns)
                            </p>

                          </div>

                          <strong className="text-pink-500 text-xl">
                            {formatarMoeda(
                              totalTema
                            )}
                          </strong>

                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

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
                  <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center">

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

      {/* ================================================= */}
      {/* MODAL NOVO APORTE */}
      {/* ================================================= */}

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
              className="w-full border border-slate-200 rounded-xl p-3 mb-5 outline-none focus:ring-2 focus:ring-blue-300"
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

      {/* ================================================= */}
      {/* MODAL META PRINCIPAL */}
      {/* ================================================= */}

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

      {/* ================================================= */}
      {/* MODAL PLANEJAMENTO */}
      {/* ================================================= */}

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
              className="w-full border border-slate-200 rounded-xl p-3 mb-4 outline-none focus:ring-2 focus:ring-blue-300"
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

      {/* ================================================= */}
      {/* MODAL NOVO ITEM */}
      {/* ================================================= */}

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
                  className="w-full border border-slate-200 rounded-xl p-3"
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
              className="w-full border border-slate-200 rounded-xl p-3 mb-5 outline-none focus:ring-2 focus:ring-blue-300"
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

      {/* ================================================= */}
      {/* MODAL EDITAR ITEM */}
      {/* ================================================= */}

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
                  className="w-full border border-slate-200 rounded-xl p-3"
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
                className="w-4 h-4"
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
              className="w-full border border-slate-200 rounded-xl p-3 mb-5 outline-none focus:ring-2 focus:ring-blue-300"
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

      {/* ================================================= */}
      {/* MODAL EDITAR APORTE */}
      {/* ================================================= */}

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
              className="w-full border border-slate-200 rounded-xl p-3 mb-5 outline-none focus:ring-2 focus:ring-blue-300"
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

      {/* ================================================= */}
      {/* MODAL EXCLUIR APORTE */}
      {/* ================================================= */}

      {aporteParaExcluir && (
        <Modal>

          <h2 className="text-2xl font-bold">
            🗑️ Apagar aporte?
          </h2>

          <p className="text-slate-500 mt-3">
            Esta ação não poderá ser
            desfeita.
          </p>

          <div className="flex gap-3 mt-6">

            <button
              onClick={() =>
                setAporteParaExcluir(
                  null
                )
              }
              className="flex-1 border border-slate-200 py-3 rounded-xl"
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
              className="flex-1 bg-red-500 text-white py-3 rounded-xl"
            >
              {excluindoAporte
                ? "Apagando..."
                : "Apagar"}
            </button>

          </div>

        </Modal>
      )}

      {/* ================================================= */}
      {/* MODAL EXCLUIR ITEM */}
      {/* ================================================= */}

      {itemParaExcluir && (
        <Modal>

          <h2 className="text-2xl font-bold">
            🗑️ Apagar item?
          </h2>

          <p className="text-slate-500 mt-3">
            Deseja apagar{" "}
            <strong>
              {itemParaExcluir.nome}
            </strong>
            ?
          </p>

          <div className="flex gap-3 mt-6">

            <button
              onClick={() =>
                setItemParaExcluir(
                  null
                )
              }
              className="flex-1 border border-slate-200 py-3 rounded-xl"
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
              className="flex-1 bg-red-500 text-white py-3 rounded-xl"
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
/* MODAL */
/* ================================================= */

function Modal({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">

      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 my-8">

        {children}

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
  return (
    <div className="flex justify-between gap-4 mb-6">

      <div>

        <h2 className="text-2xl font-bold">
          {titulo}
        </h2>

        <p className="text-slate-500 mt-1">
          {descricao}
        </p>

      </div>

      <button
        onClick={fechar}
        className="text-3xl text-slate-400 hover:text-slate-700 h-fit"
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
  return (
    <div className="mb-4">

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
        className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
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
  return (
    <div className="mb-4">

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
        className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-300"
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
  return (
    <button
      disabled={carregando}
      className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3 rounded-xl font-semibold transition"
    >
      {carregando
        ? "Salvando..."
        : texto}
    </button>
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
      className={`bg-white rounded-3xl p-6 border shadow-sm ${classe}`}
    >

      <p className="text-slate-500">
        {icone} {titulo}
      </p>

      <h3
        className={`text-3xl font-bold mt-3 ${corTexto}`}
      >
        {valor}
      </h3>

    </div>
  );
}

/* ================================================= */
/* CARD ITEM */
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
      className={`bg-white border rounded-3xl p-6 shadow-sm transition hover:shadow-md ${
        item.comprado
          ? "border-blue-200"
          : "border-slate-200"
      }`}
    >

      <div className="flex justify-between gap-4">

        <div>

          <h3
            className={`text-xl font-bold ${
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
            <p className="text-sm text-pink-500 font-medium mt-2">
              🏷️ {item.tema}
            </p>
          )}

          {item.loja && (
            <p className="text-sm text-slate-500 mt-2">
              🏪 {item.loja}
            </p>
          )}

          <p className="text-sm text-slate-500 mt-3">
            Quantidade:{" "}
            <strong>
              {quantidade}
            </strong>
          </p>

          <p className="text-blue-600 font-bold text-xl mt-2">
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

        <div className="flex gap-2 h-fit">

          <button
            onClick={() =>
              editar(item)
            }
            className="w-10 h-10 bg-blue-50 hover:bg-blue-100 rounded-xl"
          >
            ✏️
          </button>

          <button
            onClick={() =>
              excluir(item)
            }
            className="w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-xl"
          >
            🗑️
          </button>

        </div>

      </div>

      {item.observacao && (
        <p className="text-sm text-slate-500 mt-4 pt-4 border-t border-slate-100">
          📝 {item.observacao}
        </p>
      )}

    </div>
  );
}