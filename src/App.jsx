import { useState, useEffect } from "react";

const SENHA_ADM = "Nuvi@tec2025";
const precoHora = 250;

const formatBRL = (v) =>
  Number(v || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

export default function App() {
  const [tela, setTela] = useState("calc");
  const [senha, setSenha] = useState("");

  const [taxaJuros, setTaxaJuros] = useState(0.018);
  const [telefone, setTelefone] = useState("5519999999999");
  const [bases, setBases] = useState([40,50,60,70,80,90,100]);

  const [anosContratoManut, setAnosContratoManut] = useState(0);

  const produtosDB = [
    { id: 1, nome: "Metalix Cut", preco: 33154.73 },
    { id: 2, nome: "Aquisição Pós-Processador", preco: 5525.79 },
    { id: 3, nome: "Licença adicional Metalix Cut", preco: 16577.36 },
    { id: 4, nome: "JobTrack", preco: 11051.58 },
	{ id: 5, nome: "Módulo - Cotação / Estimativa - Opção para Metalix Cut", preco: 3683.86 }
  ];

  const servicosDB = [
    { id: 1, nome: "Treinamento", horas: 24 },
    { id: 2, nome: "Implantação", horas: 40 }
  ];

  const [produtosSelecionados, setProdutosSelecionados] = useState([]);
  const [produtoAtual, setProdutoAtual] = useState("");
  const [servicosSelecionados, setServicosSelecionados] = useState([]);
  const [taxa, setTaxa] = useState(40);
  const [anosContrato, setAnosContrato] = useState(1);

  const parcelas = anosContrato * 12;

  // RESET AUTOMÁTICO DO CONTRATO
  useEffect(() => {
    if (parcelas <= 12) {
      setAnosContratoManut(0);
    }
  }, [parcelas]);

  const adicionarProduto = () => {
    const produto = produtosDB.find(p => p.id == produtoAtual);
    if (produto && !produtosSelecionados.find(p => p.id === produto.id)) {
      setProdutosSelecionados([...produtosSelecionados, produto]);
    }
  };

  const toggleServico = (servico) => {
    const exists = servicosSelecionados.find(s => s.id === servico.id);
    if (exists) {
      setServicosSelecionados(servicosSelecionados.filter(s => s.id !== servico.id));
    } else {
      setServicosSelecionados([...servicosSelecionados, { ...servico }]);
    }
  };

  const atualizarHoras = (id, horas) => {
    setServicosSelecionados(servicosSelecionados.map(s =>
      s.id === id ? { ...s, horas: Number(horas) } : s
    ));
  };

  const calcular = () => {
    const valorProdutos = produtosSelecionados.reduce((acc, p) => acc + p.preco, 0);

    const valorComBase = valorProdutos * (1 + taxa / 100);

    // CONTRATO 8%
    const adicionalContrato = valorComBase * (0.08 * anosContratoManut);
    const valorFinalBase = valorComBase + adicionalContrato;

    const totalServicos = servicosSelecionados.reduce(
      (acc, s) => acc + s.horas * precoHora,
      0
    );

    const i = Number(taxaJuros.toFixed(4));
    const n = parcelas;

    const parcelaBase =
      valorFinalBase *
      ((i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1));

    const totalFinalProdutos = parcelaBase * n;

    const entrada = totalFinalProdutos * 0.10;

    const parcelasReais = n - 1;

    const parcela = (totalFinalProdutos - entrada) / parcelasReais;

    // SERVIÇOS
    let parcelasServico = 1;
    if (totalServicos > 5000 && totalServicos <= 10000) parcelasServico = 2;
    if (totalServicos > 10000) parcelasServico = 3;

    const parcelaServico = totalServicos / parcelasServico;

    const totalGeral = totalFinalProdutos;

    const valorAvista = valorFinalBase * 0.95;

    return {
      entrada,
      parcela,
      parcelasReais,
      totalServicos,
      totalProdutos: valorFinalBase,
      totalGeral,
      valorAvista,
      parcelasServico,
      parcelaServico
    };
  };

  const r = calcular();

  const enviarWhatsApp = () => {
    let msg = `*PROPOSTA NUVIATEC*\n\n`;

    msg += `💰 Produtos\n`;
    msg += `Entrada: ${formatBRL(r.entrada)}\n`;
    msg += `+ ${r.parcelasReais}x de ${formatBRL(r.parcela)}\n\n`;

    msg += `🛠️ Serviços\n`;
    msg += `${r.parcelasServico}x de ${formatBRL(r.parcelaServico)}\n\n`;

    msg += `💵 Total: ${formatBRL(r.totalGeral)}\n`;
    msg += `💸 À vista (5% OFF): ${formatBRL(r.valorAvista)}`;

    window.open(`https://wa.me/${telefone}?text=${encodeURIComponent(msg)}`);
  };

  if (tela === "login") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="bg-zinc-900 p-6 rounded-xl">
          <h2>Senha ADM</h2>
          <input type="password" value={senha} onChange={(e)=>setSenha(e.target.value)} className="p-2 w-full my-3 bg-zinc-800" />
          <button onClick={()=> senha===SENHA_ADM ? setTela("adm") : alert("Senha incorreta")} className="bg-green-600 p-2 w-full">Entrar</button>
        </div>
      </div>
    );
  }

  if (tela === "adm") {
    return (
      <div className="min-h-screen bg-black text-white p-6 space-y-6">
        <h1 className="text-2xl font-bold">Painel ADM</h1>

        <div className="bg-zinc-900 p-4 rounded-xl">
          <label>Juros (%)</label>
          <input type="number" value={taxaJuros*100} onChange={(e)=>setTaxaJuros(Number(e.target.value)/100)} className="w-full p-2 bg-zinc-800 mb-2" />

          <label>Telefone</label>
          <input value={telefone} onChange={(e)=>setTelefone(e.target.value)} className="w-full p-2 bg-zinc-800 mb-2" />

          <label>Bases (%)</label>
          {bases.map((b,i)=>(
            <input key={i} value={b} type="number" onChange={(e)=>{
              let copy=[...bases];
              copy[i]=Number(e.target.value);
              setBases(copy);
            }} className="w-full p-2 mb-2 bg-zinc-800" />
          ))}
        </div>

        <button onClick={()=>setTela("calc")} className="bg-blue-600 w-full p-3">Voltar</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="bg-zinc-900 p-6 rounded-2xl w-full max-w-md">

        <div className="flex justify-between mb-4">
          <h1 className="text-xl font-bold">Nuviatec Calc</h1>
          <button onClick={()=>setTela("login")}>⚙️</button>
        </div>

        <select value={taxa} onChange={(e)=>setTaxa(parseInt(e.target.value))} className="w-full p-3 mb-3 bg-zinc-800">
          {bases.map((b,i)=>(<option key={i} value={b}>Base {i+1}</option>))}
        </select>

        <select value={anosContrato} onChange={(e)=>setAnosContrato(parseInt(e.target.value))} className="w-full p-3 mb-3 bg-zinc-800">
          <option value={1}>12x</option>
          <option value={2}>24x</option>
          <option value={3}>36x</option>
          <option value={4}>48x</option>
          <option value={5}>60x</option>
        </select>

        {parcelas > 12 && (
          <div className="mb-3">
            <label className="text-sm">Contrato de Manutenção</label>
            <select value={anosContratoManut} onChange={(e)=>setAnosContratoManut(parseInt(e.target.value))} className="w-full p-3 bg-zinc-800 rounded">
              <option value={0}>Sem contrato</option>
              <option value={1}>1 ano</option>
              <option value={2}>2 anos</option>
              <option value={3}>3 anos</option>
              <option value={4}>4 anos</option>
              <option value={5}>5 anos</option>
            </select>
          </div>
        )}

        <select onChange={(e)=>setProdutoAtual(e.target.value)} className="w-full p-3 bg-zinc-800 mb-2">
          <option value="">Selecione produto...</option>
          {produtosDB.map(p=>(<option key={p.id} value={p.id}>{p.nome}</option>))}
        </select>

        <button onClick={adicionarProduto} className="bg-blue-600 w-full p-2 mb-3">Adicionar Produto</button>

        {produtosSelecionados.map(p => (
          <div key={p.id} className="flex justify-between bg-zinc-800 p-2 mb-1 rounded">
            <span>{p.nome}</span>
            <button onClick={()=>setProdutosSelecionados(produtosSelecionados.filter(x=>x.id!==p.id))}>❌</button>
          </div>
        ))}

        {servicosDB.map((s) => {
          const sel = servicosSelecionados.find(x => x.id === s.id);
          return (
            <div key={s.id}>
              <input type="checkbox" checked={!!sel} onChange={()=>toggleServico(s)} /> {s.nome}
              {sel && (
                <input type="number" value={sel.horas} onChange={(e)=>atualizarHoras(s.id, e.target.value)} className="w-full p-2 bg-zinc-800 mt-1" />
              )}
            </div>
          )
        })}

        <button onClick={enviarWhatsApp} className="w-full bg-green-600 p-3 mt-3 font-bold">
          Enviar WhatsApp
        </button>

        <div className="bg-zinc-800 p-4 mt-4 rounded-xl space-y-4">

          <div className="bg-zinc-900 p-3 rounded-lg">
            <p className="text-sm text-gray-400">💰 Produtos</p>
            <p className="text-lg font-bold">{formatBRL(r.totalProdutos)}</p>
            <p>Entrada: {formatBRL(r.entrada)}</p>
            <p>+ {r.parcelasReais}x de {formatBRL(r.parcela)}</p>
          </div>

          <div className="bg-zinc-900 p-3 rounded-lg">
            <p className="text-sm text-gray-400">🛠️ Serviços</p>
            <p className="text-lg font-bold">{formatBRL(r.totalServicos)}</p>
            <p>{r.parcelasServico}x de {formatBRL(r.parcelaServico)}</p>
          </div>

          <div className="bg-black p-4 rounded-lg border border-green-500">
            <p className="text-sm">Total Geral (Produtos)</p>
            <p className="text-2xl font-bold">{formatBRL(r.totalGeral)}</p>
          </div>

          <div className="bg-green-900/30 p-4 rounded-lg border border-green-500">
            <p className="text-sm text-green-400">À vista (5% de desconto)</p>
            <p className="text-2xl font-bold text-green-400">
              {formatBRL(r.valorAvista)}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}