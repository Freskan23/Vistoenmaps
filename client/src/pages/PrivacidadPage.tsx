import PaginaLegal from "./PaginaLegal";

export default function PrivacidadPage() {
  return (
    <PaginaLegal
      titulo="Política de privacidad"
      descripcion="Cómo trata Visto en Maps los datos personales: qué se recoge, para qué y cómo ejercer tus derechos."
      ruta="privacidad"
      actualizado="11 de septiembre de 2026"
      secciones={[
        {
          titulo: "Navegar por el directorio no exige darnos datos",
          parrafos: [
            "Puedes consultar cualquier ficha, categoría o ciudad sin registrarte ni facilitar dato personal alguno.",
            "Solo tratamos datos personales en dos casos: cuando nos escribes por el formulario de contacto y cuando creas una cuenta para gestionar la ficha de tu negocio.",
          ],
        },
        {
          titulo: "Qué datos y para qué",
          parrafos: [
            "Formulario de contacto: nombre, correo electrónico, teléfono si lo indicas y el mensaje. Se usan únicamente para responderte.",
            "Cuenta de negocio: correo electrónico y los datos de la ficha que tú mismo introduces. Se usan para que puedas gestionar tu presencia en el directorio.",
            "La base legal es tu consentimiento al enviar el formulario o crear la cuenta, y el interés legítimo en mantener el directorio actualizado.",
          ],
        },
        {
          titulo: "Datos de negocios publicados en el directorio",
          parrafos: [
            "Las fichas contienen información pública de empresas y profesionales (nombre comercial, dirección, teléfono de contacto, horario y valoraciones publicadas), obtenida de fuentes accesibles al público.",
            "Si eres el titular de un negocio y quieres modificar o retirar su ficha, escríbenos y lo hacemos.",
          ],
        },
        {
          titulo: "Con quién se comparten",
          parrafos: [
            "No se venden ni se ceden datos a terceros con fines comerciales.",
            "Se emplean proveedores necesarios para que el sitio funcione: alojamiento web y base de datos. Estos proveedores tratan los datos por cuenta nuestra y bajo contrato.",
          ],
        },
        {
          titulo: "Cuánto tiempo se conservan",
          parrafos: [
            "Los mensajes de contacto se conservan mientras dure la consulta y el tiempo necesario para atender posibles responsabilidades. Los datos de cuenta, mientras la cuenta siga activa.",
          ],
        },
        {
          titulo: "Tus derechos",
          parrafos: [
            "Puedes solicitar acceso, rectificación, supresión, limitación, portabilidad u oposición escribiéndonos desde la página de contacto. También puedes reclamar ante la Agencia Española de Protección de Datos (www.aepd.es).",
          ],
        },
      ]}
    />
  );
}
