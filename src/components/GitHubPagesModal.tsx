import React from 'react';
import { X, Globe, CheckCircle2, AlertTriangle, ArrowRight, Terminal, Github, Server, ExternalLink } from 'lucide-react';

interface GitHubPagesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubPagesModal: React.FC<GitHubPagesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Publicação no GitHub Pages</h3>
              <p className="text-xs text-slate-400">Como hospedar este sistema como site</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 leading-relaxed">
          {/* Status Alert */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start space-x-3 text-emerald-950">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">O projeto já está 100% configurado para GitHub Pages!</h4>
              <p className="text-xs text-emerald-800 mt-0.5">
                Configuramos o Vite com caminhos relativos (<code>base: './'</code>), redirecionamento SPA (<code>404.html</code>), fluxo automático do GitHub Actions (<code>.github/workflows/deploy.yml</code>) e persistência de dados local híbrida.
              </p>
            </div>
          </div>

          {/* Important explanation about Static vs Server */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start space-x-3 text-amber-950">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">Como funciona no GitHub Pages vs Hospedagem com Servidor:</h4>
              <ul className="list-disc pl-4 mt-1.5 space-y-1 text-amber-900">
                <li>
                  <strong>GitHub Pages (Hospedagem Estática Gratuita):</strong> O painel, gerador de QR Codes, modo estático, personalização, download de PNG/SVG e impressões funcionam 100%. Os dados ficam salvos com segurança no seu navegador via <code>localStorage</code> (com opção de exportar/importar backup JSON).
                </li>
                <li>
                  <strong>QR Codes Dinâmicos Remotos em larga escala:</strong> Quando um cliente escaneia o QR Code dinâmico do Wi-Fi na rua ou na loja, o celular dele precisa acessar a rede para buscar a senha atualizada. Para ter um banco de dados centralizado acessível por qualquer celular sem depender de arquivo local, você também pode subir o repositório em serviços com backend gratuito (como Vercel, Render ou Railway) com o comando <code>npm start</code>.
                </li>
              </ul>
            </div>
          </div>

          {/* Step by step to deploy to GitHub Pages */}
          <div>
            <h4 className="font-bold text-sm text-slate-900 mb-2">Passo a Passo para Publicar:</h4>
            <div className="space-y-2.5">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="font-bold text-slate-800 block mb-0.5">1. Crie um repositório no GitHub</span>
                <p className="text-slate-500 text-[11px]">
                  Crie um repositório público ou privado no seu GitHub (ex: <code>meu-qr-dinamico</code>).
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="font-bold text-slate-800 block mb-0.5">2. Envie os arquivos do projeto</span>
                <p className="text-slate-500 text-[11px]">
                  Faça o push do código para o GitHub. O arquivo <code>.github/workflows/deploy.yml</code> já está criado!
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="font-bold text-slate-800 block mb-0.5">3. Ative o GitHub Pages</span>
                <p className="text-slate-500 text-[11px]">
                  No GitHub, vá em <strong>Settings</strong> → <strong>Pages</strong> → Em <em>Source</em>, selecione <strong>GitHub Actions</strong>.
                  O GitHub irá compilar o projeto e gerar o seu link de acesso (ex: <code>https://seunome.github.io/meu-qr-dinamico/</code>).
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors"
            >
              Entendido e Pronto
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
