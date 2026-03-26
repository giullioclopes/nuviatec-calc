import { useState, useEffect } from "react";

const SENHA_ADM = "1234";
const precoHora = 250;

const formatBRL = (v) =>
  Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function App() {
  const [tela, setTela] = useState("calc");
  const [senha, setSenha] = useState("");

  const [taxaJuros] = useState(0.018);
  const [telefone] = useState("5519999999999");
  const [bases] = useState([40,50,60,70,80,90,100]);

  // ===== FIXOS =====
  const PRODUTOS_FIXOS = [
    { id: 1, nome: "Metalix Cut", preco: 33154.73 },
    { id: 2, nome: "Usuário Adicional", preco: 5000 },
    { id: 3, nome: "Pós Processador", preco: 8000 },
	{ id: 4, nome: "JobTrack", preco: 5000 }
  ];

  const SERVICOS_FIXOS = [
    { id: 1, nome: "Treinamento", horas: 24 },
    { id: 2, nome: "Implantação", horas: 40 }
  ];

  // ===== PRODUTOS =====
  const [produtosDB, setProdutosDB] = useState(() => {
    const salvo = localStorage.getItem("produtosDB");
    if (salvo) {
      const dados = JSON.parse(salvo);
      const ids = dados.map(p => p.id);
      const faltantes = PRODUTOS_FIXOS.filter(p => !ids.includes(p.id));
      return [...dados, ...faltantes];
    }
    return PRODUTOS_FIXOS;
  });

  const [novoProduto, setNovoProduto] = useState({ nome: "", preco: "" });

  // ===== SERVIÇOS =====
  const [servicosDB, setServicosDB] = useState(() => {
    const salvo = localStorage.getItem("servicosDB");
    if (salvo) {
      const dados = JSON.parse(salvo);
      const ids = dados.map(s => s.id);
      const faltantes = SERVICOS_FIXOS.filter(s => !ids.includes(s.id));
      return [...dados, ...faltantes];
    }
    return SERVICOS_FIXOS;
  });

  const [novoServico, setNovoServico] = useState({ nome: "", horas: "" });

  // ===== SAVE =====
  useEffect(() => {
    localStorage.setItem("produtosDB", JSON.stringify(produtosDB));
  }, [produtosDB]);

  useEffect(() => {
    localStorage.setItem("servicosDB", JSON.stringify(servicosDB));
  }, [servicosDB]);

  // ===== CALC =====
  const [produtosSelecionados, setProdutosSelecionados] = useState([]);
  const [produtoAtual, setProdutoAtual] = useState("");
  const [servicosSelecionados, setServicosSelecionados] = useState([]);
  const [taxa, setTaxa] = useState(40);
  const [anosContrato, setAnosContrato] = useState(1);

  const parcelas = anosContrato * 12;

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
    const valorComTaxa = valorProdutos * (1 + taxa / 100);

    const i = taxaJuros;
    const n = parcelas;

    const parcelaProduto =
      valorComTaxa *
      ((i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1));

    const entrada = parcelaProduto;
    const totalProduto = parcelaProduto * n;

    const totalServicos = servicosSelecionados.reduce(
      (acc, s) => acc + s.horas * precoHora,
      0
    );

    return {
      entrada,
      parcelaProduto,
      parcelasReais: n - 1,
      totalProduto,
      totalServicos,
      totalGeral: totalProduto + totalServicos,
    };
  };

  const r = calcular();

  const enviarWhatsApp = () => {
    let msg = `*PROPOSTA NUVIATEC*\n\n`;
    msg += `Entrada: ${formatBRL(r.entrada)}\n`;
    msg += `${r.parcelasReais}x de ${formatBRL(r.parcelaProduto)}\n`;
    msg += `Total: ${formatBRL(r.totalGeral)}`;

    window.open(`https://wa.me/${telefone}?text=${encodeURIComponent(msg)}`);
  };

  if (tela === "login") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="bg-zinc-900 p-6 rounded-xl w-full max-w-sm">
          <h2 className="text-lg font-bold">Senha ADM</h2>
          <input type="password" value={senha} onChange={(e)=>setSenha(e.target.value)} className="p-2 w-full my-3 bg-zinc-800 rounded" />
          <button onClick={()=> senha===SENHA_ADM ? setTela("adm") : alert("Senha incorreta")} className="bg-green-600 p-2 w-full rounded">Entrar</button>
        </div>
      </div>
    );
  }

  if (tela === "adm") {
    return (
      <div className="min-h-screen bg-black text-white p-6 space-y-6">
        <h1 className="text-2xl font-bold">Painel ADM</h1>

        <div className="bg-zinc-900 p-4 rounded-xl">
          <h2 className="font-bold mb-2">Produtos</h2>
          {produtosDB.map(p => (
            <div key={p.id} className="flex justify-between mb-1">
              <span>{p.nome} - {formatBRL(p.preco)}</span>
              <button onClick={()=>setProdutosDB(produtosDB.filter(x=>x.id!==p.id))}>❌</button>
            </div>
          ))}

          <input placeholder="Nome" value={novoProduto.nome} onChange={(e)=>setNovoProduto({...novoProduto,nome:e.target.value})} className="w-full p-2 mt-2 bg-zinc-800 rounded" />
          <input placeholder="Preço" type="number" value={novoProduto.preco} onChange={(e)=>setNovoProduto({...novoProduto,preco:e.target.value})} className="w-full p-2 mt-2 bg-zinc-800 rounded" />

          <button onClick={()=>{
            setProdutosDB([...produtosDB,{id:Date.now(), nome:novoProduto.nome, preco:Number(novoProduto.preco)}]);
            setNovoProduto({nome:"",preco:""});
          }} className="bg-green-600 w-full p-2 mt-2 rounded">Adicionar Produto</button>
        </div>

        <div className="bg-zinc-900 p-4 rounded-xl">
          <h2 className="font-bold mb-2">Serviços</h2>
          {servicosDB.map(s => (
            <div key={s.id} className="flex justify-between mb-1">
              <span>{s.nome} - {s.horas}h</span>
              <button onClick={()=>setServicosDB(servicosDB.filter(x=>x.id!==s.id))}>❌</button>
            </div>
          ))}

          <input placeholder="Nome" value={novoServico.nome} onChange={(e)=>setNovoServico({...novoServico,nome:e.target.value})} className="w-full p-2 mt-2 bg-zinc-800 rounded" />
          <input placeholder="Horas" type="number" value={novoServico.horas} onChange={(e)=>setNovoServico({...novoServico,horas:e.target.value})} className="w-full p-2 mt-2 bg-zinc-800 rounded" />

          <button onClick={()=>{
            setServicosDB([...servicosDB,{id:Date.now(), nome:novoServico.nome, horas:Number(novoServico.horas)}]);
            setNovoServico({nome:"",horas:""});
          }} className="bg-green-600 w-full p-2 mt-2 rounded">Adicionar Serviço</button>
        </div>

        <button onClick={()=>setTela("calc")} className="bg-blue-600 w-full p-3 rounded">Voltar</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="bg-zinc-900 p-6 rounded-2xl shadow-xl w-full max-w-md">

        <div className="flex justify-between mb-4">
          <h1 className="text-xl font-bold">Nuviatec Calc</h1>
          <button onClick={()=>setTela("login")}>⚙️</button>
        </div>

        <select value={taxa} onChange={(e)=>setTaxa(parseInt(e.target.value))} className="w-full p-3 mb-3 rounded bg-zinc-800">
          {bases.map((b,i)=>(<option key={i} value={b}>Base{i+1}</option>))}
        </select>

        <select value={anosContrato} onChange={(e)=>setAnosContrato(parseInt(e.target.value))} className="w-full p-3 mb-3 rounded bg-zinc-800">
          <option value={1}>1 ano (12x)</option>
          <option value={2}>2 anos (24x)</option>
          <option value={3}>3 anos (36x)</option>
          <option value={4}>4 anos (48x)</option>
          <option value={5}>5 anos (60x)</option>
        </select>

        <label className="text-sm">Adicionar Produto</label>
        <div className="flex gap-2 mb-2">
          <select onChange={(e)=>setProdutoAtual(e.target.value)} className="w-full p-3 rounded bg-zinc-800">
            <option value="">Selecione...</option>
            {produtosDB.map(p=>(<option key={p.id} value={p.id}>{p.nome}</option>))}
          </select>
          <button onClick={adicionarProduto} className="bg-blue-600 px-3 rounded">+</button>
        </div>

        <div className="mb-3 space-y-1">
          {produtosSelecionados.map(p => (
            <div key={p.id} className="flex justify-between bg-zinc-800 p-2 rounded">
              <span className="text-xs">{p.nome}</span>
              <button onClick={()=>setProdutosSelecionados(produtosSelecionados.filter(x=>x.id!==p.id))}>❌</button>
            </div>
          ))}
        </div>

        <label className="text-sm">Serviços</label>
        <div className="mb-3 space-y-2">
          {servicosDB.map(s => (
            <div key={s.id}>
              <div className="flex items-center gap-2">
                <input type="checkbox" onChange={()=>toggleServico(s)} />
                <span>{s.nome}</span>
              </div>

              {servicosSelecionados.find(x=>x.id===s.id) && (
                <input type="number" value={servicosSelecionados.find(x=>x.id===s.id).horas} onChange={(e)=>atualizarHoras(s.id, e.target.value)} className="w-full p-2 mt-1 rounded bg-zinc-800" />
              )}
            </div>
          ))}
        </div>

        <button onClick={enviarWhatsApp} className="w-full bg-green-600 p-3 rounded mb-3 font-bold">Enviar para WhatsApp</button>

        <div className="bg-zinc-800 p-4 rounded-xl text-sm space-y-2">
          <p><b>Produto:</b></p>
          <p>Entrada: {formatBRL(r.entrada)}</p>
          <p>{r.parcelasReais}x de {formatBRL(r.parcelaProduto)}</p>

          <p className="mt-3"><b>Serviços:</b></p>
          <p>Total: {formatBRL(r.totalServicos)}</p>
          <p>{r.totalServicos > 10000 ? '2x' : '1x'} de {formatBRL(r.totalServicos > 10000 ? r.totalServicos/2 : r.totalServicos)}</p>

          <p className="mt-3 text-lg"><b>Total Geral:</b> {formatBRL(r.totalGeral)}</p>

          <p className="mt-3"><b>À Vista (5%):</b></p>
          <p className="text-green-400 font-bold">{formatBRL(r.totalGeral * 0.95)}</p>
        </div>
      </div>
    </div>
  );
}
