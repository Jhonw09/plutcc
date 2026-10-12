import { ENDPOINTS, api } from '../apiClient'

export async function criarTicket({ tipo, mensagem }) {
  return api(ENDPOINTS.tickets, {
    method: 'POST',
    body: JSON.stringify({ tipo, mensagem }),
  }).catch(err => {
    if (err.status === 429) throw new Error('Muitas mensagens. Aguarde antes de enviar outra.')
    throw new Error('Não foi possível enviar o ticket. Tente novamente.')
  })
}

export async function getTickets() {
  return api(ENDPOINTS.tickets).catch(() => { throw new Error('Erro ao carregar tickets.') })
}

export async function responderTicket(id, resposta) {
  return api(`${ENDPOINTS.ticketById(id)}/responder`, {
    method: 'POST',
    body: JSON.stringify({ resposta }),
  }).catch(err => {
    throw new Error(err.message || 'Não foi possível responder o ticket.')
  })
}

export async function fecharTicket(id) {
  return api(`${ENDPOINTS.ticketById(id)}/fechar`, {
    method: 'POST',
  }).catch(() => { throw new Error('Não foi possível fechar o ticket.') })
}
