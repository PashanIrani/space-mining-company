export function randomIntFromInterval(min: number, max: number) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function formatNumberToString(value: number, decimals: number = 0, charLength: number = -1) {
  // Round the value to the specified number of decimal places
  let roundedValue = value.toFixed(decimals);

  // Check if the rounded value has only zeroes after the decimal point
  if (decimals > 0) {
    let decimalStr = roundedValue.split(".")[1];
    if (decimalStr && parseFloat(decimalStr) === 0) {
      // Find the minimum number of decimal places required to show some non-zero numbers
      for (let i = decimals; i < 20; i++) {
        let newRoundedValue = value.toFixed(i);
        let newDecimalStr = newRoundedValue.split(".")[1];
        if (newDecimalStr && parseFloat(newDecimalStr) !== 0) {
          decimals = i;
          roundedValue = newRoundedValue;
          break;
        }
      }
    }
  }

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


export function convertTime(num: number): string {
  if (isNaN(num)) {
    return "Invalid Time";
  }

  if (num < 0) {
    num *= -1;
  }

  if (num < 60) {
    return `${formatNumberToString(num)}s`;
  }
  if (num < 3600) {
    const mins = Math.floor(num / 60);
    const secs = num % 60;
    return `${formatNumberToString(mins)}m ${formatNumberToString(secs)}s`;
  }
  if (num < 86400) {
    const hours = Math.floor(num / 3600);
    const mins = Math.floor((num % 3600) / 60);
    const secs = num % 60;
    return `${formatNumberToString(hours)}h ${formatNumberToString(mins)}m ${formatNumberToString(secs)}s`;
  }
  const days = Math.floor(num / 86400);
  const hours = Math.floor((num % 86400) / 3600);
  const mins = Math.floor((num % 3600) / 60);
  const secs = num % 60;
  return `${formatNumberToString(days)}d ${formatNumberToString(hours)}h ${formatNumberToString(mins)}m ${formatNumberToString(secs)}s`;
}
