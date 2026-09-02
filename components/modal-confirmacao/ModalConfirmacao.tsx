// MODAL PERSONALIZADO UTILIZADO NAS CONFIRMAÇÕES DO GABIFLIX

// Componentes utilizados para montar o modal
import {
  Modal,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
// Estilos exclusivos do componente
import { styles } from './ModalConfirmacao.styles';


// Representa cada ação que pode ser exibida no modal
interface AcaoModal {
  texto: string;
  tipo?: 'principal' | 'secundario' | 'cancelar';
  onPress: () => void;
}

// Dados que precisam ser enviados para o componente
interface ModalConfirmacaoProps {
  visivel: boolean;
  titulo: string;
  descricao?: string;
  acoes: AcaoModal[];
  onFechar: () => void;
}

// Modal utilizado no lugar das confirmações nativas do React Native
export function ModalConfirmacao({
  visivel,
  titulo,
  descricao,
  acoes,
  onFechar,
}: ModalConfirmacaoProps) {
  return (
    <Modal
      visible={visivel}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onFechar}
    >
      {/* Fundo escuro colocado atrás da caixa de confirmação */}
      <View style={styles.overlay}>
        {/* Caixa principal do modal */}
        <View style={styles.modal}>
          {/* Título apresentado no início da confirmação */}
          <Text style={styles.titulo}>
            {titulo}
          </Text>

          {/* Texto explicativo opcional */}
          {descricao ? (
            <Text style={styles.descricao}>
              {descricao}
            </Text>
          ) : null}

          {/* Botões disponíveis para a confirmação */}
          <View style={styles.acoes}>
            {acoes.map((acao, indice) => {
              const tipo =
                acao.tipo ?? 'secundario';

              return (
                <TouchableOpacity
                  key={`${acao.texto}-${indice}`}
                  activeOpacity={0.8}
                  style={[
                    styles.botao,
                    tipo === 'principal' &&
                      styles.botaoPrincipal,
                    tipo === 'secundario' &&
                      styles.botaoSecundario,
                    tipo === 'cancelar' &&
                      styles.botaoCancelar,
                  ]}
                  onPress={acao.onPress}
                >
                  <Text
                    style={[
                      styles.textoBotao,
                      tipo === 'principal' &&
                        styles.textoBotaoPrincipal,
                      tipo === 'secundario' &&
                        styles.textoBotaoSecundario,
                      tipo === 'cancelar' &&
                        styles.textoBotaoCancelar,
                    ]}
                  >
                    {acao.texto}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}