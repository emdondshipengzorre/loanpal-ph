import { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import {
  extractTextFromImage,
  parseMultipleLoans,
  ParsedLoanItem,
} from "../src/lib/ocr";
import { useLoanStore } from "../src/store/loanStore";
import { getLendingAppName } from "../src/lib/lending-apps";
import { formatPHP } from "../src/lib/dates";
import { colors } from "../src/theme/colors";
import { typography } from "../src/theme/typography";
import { spacing, borderRadius } from "../src/theme/spacing";

type Phase = "capture" | "processing" | "review";

export default function ScanScreen() {
  const router = useRouter();
  const addLoan = useLoanStore((s) => s.addLoan);
  const cameraRef = useRef<CameraView>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [phase, setPhase] = useState<Phase>("capture");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [rawText, setRawText] = useState("");
  const [items, setItems] = useState<ParsedLoanItem[]>([]);
  const [importing, setImporting] = useState(false);

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
    if (photo) {
      processImage(photo.uri);
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      processImage(result.assets[0].uri);
    }
  };

  const processImage = async (uri: string) => {
    setImageUri(uri);
    setPhase("processing");
    try {
      const text = await extractTextFromImage(uri);
      setRawText(text);
      const parsed = parseMultipleLoans(text);
      setItems(parsed);
      setPhase("review");
    } catch {
      Alert.alert("OCR Failed", "Could not read text from this image. Try a clearer photo.");
      setPhase("capture");
    }
  };

  const toggleItem = (index: number) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const handleImport = async () => {
    const selected = items.filter((i) => i.selected);
    if (selected.length === 0) {
      Alert.alert("Nothing selected", "Select at least one item to import.");
      return;
    }
    setImporting(true);
    try {
      for (const item of selected) {
        await addLoan({
          app: item.app || "Other",
          amountBorrowed: item.amount,
          remainingBalance: item.amount,
          monthlyPayment: item.amount,
          nextDueDate: item.dueDate || new Date().toISOString().slice(0, 10),
          status: "active",
        });
      }
      Alert.alert(
        "Imported",
        `${selected.length} loan${selected.length !== 1 ? "s" : ""} added. Review and edit details in the Loans tab.`,
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch {
      Alert.alert("Error", "Failed to import some loans. Please try again.");
    } finally {
      setImporting(false);
    }
  };

  const handleRetake = () => {
    setPhase("capture");
    setImageUri(null);
    setRawText("");
    setItems([]);
  };

  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={28} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={typography.h3}>Scan Document</Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={styles.centered}>
          <Ionicons name="close-circle-outline" size={48} color={colors.mutedForeground} />
          <Text style={[typography.body, { color: colors.mutedForeground, marginTop: spacing.md, textAlign: "center" }]}>
            Camera access is needed to scan loan documents
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={requestPermission}>
            <Text style={styles.primaryButtonText}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={handlePickImage}>
            <Ionicons name="images-outline" size={20} color={colors.primary} />
            <Text style={[typography.label, { color: colors.primary }]}>Pick from Gallery</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (phase === "processing") {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleRetake}>
            <Ionicons name="arrow-back" size={28} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={typography.h3}>Processing</Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={styles.centered}>
          {imageUri && (
            <Image source={{ uri: imageUri }} style={styles.previewThumb} />
          )}
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.lg }} />
          <Text style={[typography.body, { color: colors.mutedForeground, marginTop: spacing.md }]}>
            Reading text from image...
          </Text>
        </View>
      </View>
    );
  }

  if (phase === "review") {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleRetake}>
            <Ionicons name="arrow-back" size={28} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={typography.h3}>Review Scan</Text>
          <View style={{ width: 28 }} />
        </View>

        {imageUri && (
          <Image source={{ uri: imageUri }} style={styles.reviewImage} />
        )}

        {items.length === 0 ? (
          <View style={styles.noResults}>
            <Ionicons name="alert-circle-outline" size={40} color={colors.mutedForeground} />
            <Text style={[typography.body, { color: colors.mutedForeground, marginTop: spacing.sm, textAlign: "center" }]}>
              No loan amounts detected. Try a clearer photo or enter loans manually.
            </Text>
            <TouchableOpacity style={styles.primaryButton} onPress={handleRetake}>
              <Text style={styles.primaryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={[typography.label, { marginBottom: spacing.sm }]}>
              Found {items.length} item{items.length !== 1 ? "s" : ""} — tap to select/deselect
            </Text>

            {items.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.itemCard, item.selected && styles.itemCardSelected]}
                onPress={() => toggleItem(index)}
              >
                <View style={styles.itemCheck}>
                  <Ionicons
                    name={item.selected ? "checkbox" : "square-outline"}
                    size={24}
                    color={item.selected ? colors.primary : colors.mutedForeground}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={typography.label}>{formatPHP(item.amount)}</Text>
                  {item.app && (
                    <Text style={[typography.caption, { color: colors.mutedForeground }]}>
                      {getLendingAppName(item.app)}
                    </Text>
                  )}
                  {item.dueDate && (
                    <Text style={[typography.caption, { color: colors.mutedForeground }]}>
                      Due: {item.dueDate}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[styles.primaryButton, importing && { opacity: 0.6 }]}
              onPress={handleImport}
              disabled={importing}
            >
              {importing ? (
                <ActivityIndicator color={colors.primaryForeground} />
              ) : (
                <Text style={styles.primaryButtonText}>
                  Import {items.filter((i) => i.selected).length} Loan{items.filter((i) => i.selected).length !== 1 ? "s" : ""}
                </Text>
              )}
            </TouchableOpacity>
          </>
        )}

        {rawText.length > 0 && (
          <View style={styles.rawTextSection}>
            <Text style={[typography.label, { marginBottom: spacing.xs }]}>Raw OCR Text</Text>
            <View style={styles.rawTextBox}>
              <Text style={[typography.caption, { color: colors.mutedForeground }]}>{rawText}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back">
        <View style={styles.cameraOverlay}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={[typography.h3, { color: "#fff" }]}>Scan Document</Text>
            <View style={{ width: 28 }} />
          </View>

          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>

          <Text style={styles.hint}>
            Position the loan statement within the frame
          </Text>

          <View style={styles.controls}>
            <TouchableOpacity style={styles.controlButton} onPress={handlePickImage}>
              <Ionicons name="images-outline" size={28} color="#fff" />
              <Text style={styles.controlLabel}>Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.captureButton} onPress={handleCapture}>
              <View style={styles.captureInner} />
            </TouchableOpacity>

            <View style={styles.controlButton}>
              <Ionicons name="flash-off-outline" size={28} color="#fff" />
              <Text style={styles.controlLabel}>Flash</Text>
            </View>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const CORNER_SIZE = 24;
const CORNER_WIDTH = 3;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    zIndex: 10,
  },
  camera: { flex: 1 },
  cameraOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "space-between",
  },
  scanFrame: {
    alignSelf: "center",
    width: "85%",
    aspectRatio: 0.7,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: CORNER_SIZE,
    height: CORNER_SIZE,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderColor: "#fff",
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderColor: "#fff",
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderColor: "#fff",
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderColor: "#fff",
  },
  hint: {
    ...typography.bodySmall,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    paddingHorizontal: spacing.lg,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  controlButton: {
    alignItems: "center",
    width: 64,
    gap: spacing.xs,
  },
  controlLabel: {
    ...typography.caption,
    color: "#fff",
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  captureInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#fff",
  },
  previewThumb: {
    width: 160,
    height: 220,
    borderRadius: borderRadius.lg,
    resizeMode: "cover",
  },
  reviewImage: {
    width: "100%",
    height: 200,
    borderRadius: borderRadius.lg,
    resizeMode: "cover",
    marginBottom: spacing.md,
  },
  noResults: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemCardSelected: {
    borderColor: colors.primary,
  },
  itemCheck: {
    marginRight: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: "center",
    marginTop: spacing.md,
    width: "100%",
  },
  primaryButtonText: {
    color: colors.primaryForeground,
    ...typography.button,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    marginTop: spacing.md,
  },
  rawTextSection: {
    marginTop: spacing.lg,
  },
  rawTextBox: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
