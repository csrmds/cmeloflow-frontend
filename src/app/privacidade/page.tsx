import type { Metadata } from "next";
import Link from "next/link";
import { PanelsTopLeft } from "lucide-react";

export const metadata: Metadata = {
	title: "Política de Privacidade | CMeloFlow",
	description:
		"Saiba como o CMeloFlow coleta, utiliza, armazena e protege dados pessoais.",
};

// TODO: preencha com os dados reais da empresa antes de publicar
const EMPRESA = "C MELO DESENVOLVIMENTO DE PROGRAMAS LTDA";
const CNPJ = "69.575.998/0001-59";
const ENDERECO = "RUA DOS ROUXINOIS, 409, AP 503 - SERRA - ES";
const EMAIL_PRIVACIDADE = "cmelosdesenvolvimento@gmail.com";
const ULTIMA_ATUALIZACAO = "22 de outubro de 2026";

function Section({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<section className="space-y-3">
			<h2 className="text-xl font-semibold tracking-tight">{title}</h2>
			<div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
				{children}
			</div>
		</section>
	);
}

function List({ items }: { items: React.ReactNode[] }) {
	return (
		<ul className="list-disc space-y-1.5 pl-5">
			{items.map((item, i) => (
				<li key={i}>{item}</li>
			))}
		</ul>
	);
}

export default function PrivacidadePage() {
	return (
		<div className="min-h-screen bg-background text-foreground">
			<header className="border-b border-border bg-background/80 backdrop-blur">
				<div className="mx-auto flex h-16 max-w-3xl items-center px-6">
					<Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
						<div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
							<PanelsTopLeft className="h-4 w-4" />
						</div>
						CMeloFlow
					</Link>
				</div>
			</header>

			<main className="mx-auto max-w-3xl space-y-10 px-6 py-12">
				<div>
					<h1 className="text-3xl font-semibold tracking-tight">
						Política de Privacidade
					</h1>
					<p className="mt-2 text-sm text-muted-foreground">
						Última atualização: {ULTIMA_ATUALIZACAO}
					</p>
				</div>

				<Section title="1. Quem somos">
					<p>
						O CMeloFlow é uma plataforma de automação de atendimento via
						WhatsApp e Instagram com inteligência artificial, que permite a
						empresas capturar leads, organizar produtos e serviços e realizar
						agendamentos. A plataforma é operada por <strong>{EMPRESA}</strong>,
						inscrita no CNPJ sob o nº {CNPJ}, com sede em {ENDERECO}
						(&quot;CMeloFlow&quot;, &quot;nós&quot;).
					</p>
					<p>
						Esta política explica como tratamos dados pessoais em conformidade
						com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD).
					</p>
				</Section>

				<Section title="2. Nosso papel no tratamento de dados">
					<List
						items={[
							<>
								<strong>Controlador:</strong> somos controlador dos dados das
								pessoas que criam conta e usam a plataforma (nossos clientes
								empresariais e seus usuários).
							</>,
							<>
								<strong>Operador:</strong> em relação aos dados dos leads e das
								conversas, atuamos em nome do cliente, que é o controlador e
								define a finalidade do uso. Tratamos esses dados apenas
								conforme as instruções do cliente e para prestar o serviço
								contratado.
							</>,
						]}
					/>
				</Section>

				<Section title="3. Dados que coletamos">
					<p>
						<strong>Dados da conta (clientes e usuários da plataforma):</strong>
					</p>
					<List
						items={[
							"nome, e-mail e senha (armazenada de forma criptografada com hash);",
							"dados de login com Google (identificador da conta Google, nome e e-mail);",
							"dados da empresa: nome, descrição, números de WhatsApp, usuário do Instagram, produtos e serviços cadastrados.",
						]}
					/>
					<p>
						<strong>Dados de leads (contatos que conversam com nossos clientes):</strong>
					</p>
					<List
						items={[
							"nome, número de telefone/WhatsApp, identificador e nome de usuário do Instagram;",
							"conteúdo das mensagens trocadas, origem do contato, status do atendimento e anotações;",
							"informações de agendamento (data, horário e e-mail informado para o convite).",
						]}
					/>
					<p>
						<strong>Dados do Google Agenda (quando o cliente conecta sua conta):</strong>{" "}
						e-mail da conta Google, lista de agendas, eventos e horários
						ocupados, além dos tokens de acesso, que armazenamos criptografados.
					</p>
					<p>
						<strong>Dados técnicos:</strong> registros de acesso e de
						funcionamento (logs), endereço IP e informações do navegador,
						necessários para segurança e diagnóstico.
					</p>
				</Section>

				<Section title="4. Para que usamos os dados">
					<List
						items={[
							"criar e autenticar contas e manter a plataforma funcionando;",
							"receber e enviar mensagens pelo WhatsApp e Instagram em nome do cliente;",
							"gerar respostas automáticas com inteligência artificial para atendimento e qualificação de leads;",
							"registrar leads, produtos e agendamentos e exibi-los ao cliente;",
							"consultar disponibilidade e criar, alterar ou cancelar eventos no Google Agenda do cliente;",
							"garantir a segurança, prevenir fraudes e cumprir obrigações legais.",
						]}
					/>
					<p>
						Não vendemos dados pessoais e não os utilizamos para publicidade de
						terceiros.
					</p>
				</Section>

				<Section title="5. Bases legais">
					<p>
						Tratamos dados com base na execução de contrato (prestação do
						serviço contratado), no legítimo interesse (segurança e melhoria do
						serviço), no cumprimento de obrigação legal e, quando necessário,
						no consentimento do titular. Em relação aos leads, a base legal é
						definida pelo cliente (controlador), que deve informar seus
						contatos sobre o uso de atendimento automatizado.
					</p>
				</Section>

				<Section title="6. Com quem compartilhamos">
					<p>
						Compartilhamos dados somente com fornecedores necessários à
						operação do serviço:
					</p>
					<List
						items={[
							<>
								<strong>Meta Platforms</strong> (WhatsApp Business Platform e
								Instagram), para envio e recebimento de mensagens;
							</>,
							<>
								<strong>Google</strong> (login e Google Agenda), mediante
								autorização do cliente;
							</>,
							<>
								<strong>OpenAI</strong>, para processamento das mensagens pela
								inteligência artificial que gera as respostas;
							</>,
							<>
								<strong>Hostinger</strong>, provedor de infraestrutura onde a
								plataforma e o banco de dados são hospedados;
							</>,
							"autoridades públicas, quando exigido por lei ou ordem judicial.",
						]}
					/>
				</Section>

				<Section title="7. Uso de dados do Google">
					<p>
						O uso e a transferência de informações recebidas das APIs do Google
						para qualquer outro aplicativo pelo CMeloFlow obedecerão à{" "}
						<a
							className="text-primary underline underline-offset-4"
							href="https://developers.google.com/terms/api-services-user-data-policy"
							target="_blank"
							rel="noopener noreferrer"
						>
							Política de Dados do Usuário dos Serviços de API do Google
						</a>
						, incluindo os requisitos de Uso Limitado.
					</p>
					<p>
						Acessamos o Google Agenda exclusivamente para exibir a agenda ao
						cliente e para consultar disponibilidade e criar, alterar e
						cancelar agendamentos solicitados por ele ou realizados pelo
						atendimento automatizado em seu nome. Não usamos esses dados para
						publicidade nem os transferimos a terceiros, exceto quando
						necessário para prestar o serviço, cumprir a lei ou com
						consentimento do cliente. O cliente pode revogar o acesso a
						qualquer momento em{" "}
						<a
							className="text-primary underline underline-offset-4"
							href="https://myaccount.google.com/permissions"
							target="_blank"
							rel="noopener noreferrer"
						>
							myaccount.google.com/permissions
						</a>
						.
					</p>
				</Section>

				<Section title="8. Transferência internacional">
					<p>
						Alguns fornecedores (como Meta, Google e OpenAI) podem tratar dados
						em servidores fora do Brasil. Nesses casos, adotamos as garantias
						previstas na LGPD para transferências internacionais.
					</p>
				</Section>

				<Section title="9. Por quanto tempo guardamos os dados">
					<p>
						Mantemos os dados enquanto a conta estiver ativa ou pelo tempo
						necessário para cumprir obrigações legais e regulatórias. Após o
						encerramento da conta, os dados são excluídos ou anonimizados,
						ressalvadas as hipóteses de guarda obrigatória por lei.
					</p>
				</Section>

				<Section title="10. Segurança">
					<p>
						Adotamos medidas técnicas e administrativas para proteger os dados,
						como comunicação criptografada (HTTPS), senhas armazenadas com hash,
						tokens de acesso a serviços de terceiros armazenados de forma
						criptografada e controle de acesso por perfil. Nenhum sistema é
						totalmente imune a riscos; em caso de incidente relevante,
						comunicaremos os afetados e a ANPD conforme a LGPD.
					</p>
				</Section>

				<Section title="11. Seus direitos">
					<p>
						Nos termos do art. 18 da LGPD, o titular pode solicitar:
						confirmação da existência de tratamento, acesso, correção,
						anonimização, bloqueio ou eliminação de dados desnecessários,
						portabilidade, informação sobre compartilhamento, revogação do
						consentimento e eliminação dos dados tratados com consentimento.
					</p>
					<p>
						Se você é um lead que conversou com uma empresa que usa o
						CMeloFlow, pode exercer esses direitos diretamente com a empresa
						ou nos contatar, e encaminharemos o pedido ao responsável.
					</p>
				</Section>

				<Section title="12. Como solicitar a exclusão dos seus dados">
					<p>
						Para solicitar a exclusão de dados pessoais ou da sua conta, envie
						um e-mail para{" "}
						<strong>{EMAIL_PRIVACIDADE}</strong> com o assunto
						&quot;Exclusão de dados&quot;, informando o e-mail da conta ou o
						número de telefone/usuário do Instagram a que os dados se referem.
						Responderemos no prazo previsto em lei. Clientes também podem
						excluir leads, produtos e telefones diretamente no painel e revogar
						a conexão do Google Agenda a qualquer momento.
					</p>
				</Section>

				<Section title="13. Cookies e armazenamento local">
					<p>
						Utilizamos cookies e armazenamento local do navegador apenas para
						manter sua sessão autenticada e lembrar preferências da interface,
						como tema e menu lateral. Não utilizamos cookies de publicidade.
					</p>
				</Section>

				<Section title="14. Crianças e adolescentes">
					<p>
						A plataforma é destinada a empresas e não é direcionada a menores
						de 18 anos.
					</p>
				</Section>

				<Section title="15. Alterações nesta política">
					<p>
						Podemos atualizar esta política periodicamente. A data da última
						atualização estará sempre indicada no topo da página, e mudanças
						relevantes serão comunicadas pela plataforma ou por e-mail.
					</p>
				</Section>

				<Section title="16. Contato">
					<p>
						Dúvidas ou solicitações sobre privacidade e proteção de dados:{" "}
						<strong>{EMAIL_PRIVACIDADE}</strong>.
					</p>
				</Section>
			</main>

			<footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
				© {new Date().getFullYear()} CMeloFlow. Todos os direitos reservados.
			</footer>
		</div>
	);
}
