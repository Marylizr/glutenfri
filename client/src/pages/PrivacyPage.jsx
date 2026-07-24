import { Link } from 'react-router-dom';
import { APP_NAME, REGION_CITIES } from '../config/brand';

const sectionStyle = { marginBottom: '24px' };
const paragraphStyle = { margin: '8px 0', lineHeight: 1.65, fontSize: '14px' };
const listStyle = { margin: '8px 0', paddingLeft: '20px', lineHeight: 1.65, fontSize: '14px' };

export default function PrivacyPage() {
  return (
    <main style={{ height: '100%', overflowY: 'auto', padding: '20px 18px 40px' }}>
      <Link
        to="/perfil"
        style={{ color: 'var(--color-accent)', textDecoration: 'none', fontSize: '13px' }}
      >
        ← Volver
      </Link>

      <article style={{ maxWidth: '720px', margin: '16px auto 0' }}>
        <h1 style={{ fontSize: '26px' }}>Política de privacidad</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', margin: '6px 0 24px' }}>
          Versión vigente desde el 24 de julio de 2026
        </p>

        <section style={sectionStyle}>
          <h2 style={{ fontSize: '18px' }}>1. Responsable del tratamiento</h2>
          <p style={paragraphStyle}>
            {APP_NAME} es una guía de establecimientos en {REGION_CITIES} gestionada por Mary
            Marquez. Para consultas o para ejercer tus derechos de protección de datos, escribe a{' '}
            <a href="mailto:marylizr@gmail.com">marylizr@gmail.com</a>.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={{ fontSize: '18px' }}>2. Datos que tratamos</h2>
          <ul style={listStyle}>
            <li>Cuenta: nombre, correo electrónico, contraseña cifrada y fecha de alta.</li>
            <li>
              Actividad: establecimientos guardados, reseñas, valoraciones y respuestas sobre
              prácticas de seguridad alimentaria.
            </li>
            <li>
              Moderación: reportes realizados y estado visible u oculto de una reseña. Solo las
              personas administradoras ven el nombre completo y correo del autor al moderar.
            </li>
            <li>
              Seguridad: la dirección IP se usa temporalmente en memoria para limitar abuso, pero
              la aplicación no la guarda en su base de datos ni la incluye en sus logs.
            </li>
          </ul>
          <p style={paragraphStyle}>
            No pedimos diagnósticos ni historiales médicos. Los comentarios son públicos: no
            incluyas información de salud, datos de terceros ni información que no quieras
            publicar.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={{ fontSize: '18px' }}>3. Geolocalización</h2>
          <p style={paragraphStyle}>
            Si autorizas tu ubicación, se utiliza únicamente en tu dispositivo para centrar el
            mapa y calcular distancias. No se envía al servidor ni se asocia a tu cuenta.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={{ fontSize: '18px' }}>4. Finalidades y bases jurídicas</h2>
          <ul style={listStyle}>
            <li>
              Crear y mantener tu cuenta, guardados y reseñas: ejecución del servicio que
              solicitas.
            </li>
            <li>
              Prevenir fraude, abuso y accesos no autorizados: interés legítimo en proteger la
              comunidad y la aplicación.
            </li>
            <li>
              Recibir reportes y moderar contenido: interés legítimo en mantener información útil
              y segura.
            </li>
            <li>Cumplir requerimientos legales válidos: obligación legal cuando corresponda.</li>
          </ul>
          <p style={paragraphStyle}>
            No usamos tus datos para publicidad, venta de perfiles ni decisiones automatizadas que
            produzcan efectos jurídicos.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={{ fontSize: '18px' }}>5. Visibilidad y destinatarios</h2>
          <p style={paragraphStyle}>
            En las reseñas públicas mostramos solo tu primer nombre. Usamos proveedores de
            infraestructura para prestar el servicio: MongoDB Atlas para la base de datos,
            y Netlify para alojar el frontend y ejecutar la API mediante Functions.
            Google Places aporta información y fotografías de establecimientos; no le enviamos tu
            cuenta, reseñas ni ubicación.
          </p>
          <p style={paragraphStyle}>
            El clúster de Atlas está configurado en Frankfurt. Algunos proveedores pueden tratar
            datos técnicos fuera del Espacio Económico Europeo bajo sus mecanismos contractuales
            de transferencia y protección aplicables. No cedemos ni vendemos datos personales.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={{ fontSize: '18px' }}>6. Conservación</h2>
          <ul style={listStyle}>
            <li>Cuenta, guardados y reseñas: hasta que elimines tu cuenta.</li>
            <li>
              Una reseña reportada puede conservarse oculta mientras sea necesario para resolver
              la moderación o defender reclamaciones.
            </li>
            <li>
              Los contadores temporales de limitación de solicitudes caducan después de su ventana
              máxima de una hora.
            </li>
          </ul>
          <p style={paragraphStyle}>
            Al eliminar la cuenta se borran tu perfil y tus reseñas de la base activa. Podrían
            permanecer copias limitadas durante el ciclo técnico de copias de seguridad del
            proveedor, inaccesibles para el uso ordinario hasta su sobrescritura.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={{ fontSize: '18px' }}>7. Tus derechos</h2>
          <p style={paragraphStyle}>
            Puedes solicitar acceso, rectificación, supresión, limitación, portabilidad u oposición
            escribiendo al correo indicado arriba. Desde Perfil también puedes descargar tus datos
            o eliminar tu cuenta directamente. Podemos pedirte que confirmes tu identidad.
          </p>
          <p style={paragraphStyle}>
            También puedes presentar una reclamación ante la{' '}
            <a href="https://www.cnpd.pt/cidadaos/participacoes/" target="_blank" rel="noreferrer">
              Comissão Nacional de Proteção de Dados (CNPD)
            </a>
            .
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={{ fontSize: '18px' }}>8. Menores y seguridad</h2>
          <p style={paragraphStyle}>
            El servicio no está dirigido a menores de 16 años. Aplicamos controles de acceso,
            cifrado de contraseñas, validación de entradas, limitación de solicitudes y conexiones
            HTTPS en producción. Ningún sistema es completamente infalible; notificaremos las
            brechas cuando la normativa lo exija.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={{ fontSize: '18px' }}>9. Cambios</h2>
          <p style={paragraphStyle}>
            Si un cambio afecta de forma material al tratamiento, mostraremos la nueva versión y,
            cuando corresponda, pediremos una nueva aceptación antes de continuar usando la
            cuenta.
          </p>
        </section>
      </article>
    </main>
  );
}
