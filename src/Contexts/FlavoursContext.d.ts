declare module "../Contexts/FlavoursContext" {
  interface Flavour {
    name: string;
    quantity: number;
    // Otras propiedades según la estructura de tus objetos
  }

  interface FlavoursContextType {
    fetchFlavoursAndSetState: () => void;
    dbFlavoursArr: Flavour[];
  }
}
