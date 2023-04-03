export function randomIntFromInterval(min: number, max: number) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function formatNumberString(value: number, decimals: number = 0, charLength: number = -1) {
  // Round the value to the specified number of decimal places
  let roundedValue = value.toFixed(decimals);

  // Split the rounded value into its integer and fractional parts
  if (charLength > 0) {
    let [intPart, fracPart] = roundedValue.split(".");

    if (intPart.length < charLength) {
      intPart = "0".repeat(charLength - intPart.length) + intPart;
    }

    if (fracPart == undefined) {
      roundedValue = intPart;
    } else {
      roundedValue = intPart + "." + fracPart
    }
  }

  return roundedValue;
}