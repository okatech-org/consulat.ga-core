import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Stamp, Upload, CheckCircle, Clock, FileText, AlertCircle, Files } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import iconLegalization from "@/assets/icons/icon-legalization.png";

export default function LegalizationServicePage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    documentType: "",
    documentCount: "1",
    documentOrigin: "",
    purpose: "",
    urgency: "normal",
    phone: "",
    email: "",
    comments: "",
  });
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Demande de légalisation soumise avec succès", {
      description: "Vous recevrez un email de confirmation sous 24h.",
    });
    setStep(3);
  };

  const documentTypes = [
    { id: "diploma", name: "Diplôme / Attestation de formation" },
    { id: "birth", name: "Acte de naissance" },
    { id: "marriage", name: "Acte de mariage" },
    { id: "death", name: "Acte de décès" },
    { id: "certificate", name: "Certificat / Attestation" },
    { id: "contract", name: "Contrat / Document juridique" },
    { id: "commercial", name: "Document commercial" },
    { id: "other", name: "Autre document" },
  ];

  const requiredDocuments = [
    "Document original à légaliser",
    "Copie du document",
    "Pièce d'identité du demandeur",
    "Formulaire de demande signé",
  ];

  const pricingInfo = [
    { type: "Document standard", price: "10 000 FCFA" },
    { type: "Document notarié", price: "15 000 FCFA" },
    { type: "Document commercial", price: "20 000 FCFA" },
    { type: "Urgence (+)", price: "+50%" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white py-16">
        <div className="container mx-auto px-4">
          <Link to="/services" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6">
            <ArrowLeft className="h-4 w-4" />
            Retour aux services
          </Link>
          <div className="flex items-center gap-6">
            <img src={iconLegalization} alt="Légalisation" className="h-20 w-20" />
            <div>
              <h1 className="text-4xl font-bold mb-2">Légalisation de Documents</h1>
              <p className="text-lg text-white/80">
                Authentification et légalisation de vos documents officiels
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            {/* Progress Steps */}
            <div className="flex items-center gap-4 mb-8">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= s ? "bg-purple-600 text-white" : "bg-muted text-muted-foreground"
                  }`}>
                    {step > s ? <CheckCircle className="h-5 w-5" /> : s}
                  </div>
                  <span className={`text-sm font-medium ${step >= s ? "text-foreground" : "text-muted-foreground"}`}>
                    {s === 1 ? "Documents" : s === 2 ? "Téléchargement" : "Confirmation"}
                  </span>
                  {s < 3 && <div className={`w-12 h-1 ${step > s ? "bg-purple-600" : "bg-muted"}`} />}
                </div>
              ))}
            </div>

            {step === 1 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card>
                  <CardHeader>
                    <CardTitle>Informations sur les documents</CardTitle>
                    <CardDescription>Décrivez les documents que vous souhaitez faire légaliser</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Nom de famille *</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Prénom(s) *</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="documentType">Type de document *</Label>
                        <Select
                          value={formData.documentType}
                          onValueChange={(value) => setFormData({ ...formData, documentType: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner le type" />
                          </SelectTrigger>
                          <SelectContent>
                            {documentTypes.map((type) => (
                              <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="documentCount">Nombre de documents *</Label>
                        <Select
                          value={formData.documentCount}
                          onValueChange={(value) => setFormData({ ...formData, documentCount: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                              <SelectItem key={n} value={n.toString()}>{n} document{n > 1 ? 's' : ''}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="documentOrigin">Pays d'origine du document *</Label>
                      <Select
                        value={formData.documentOrigin}
                        onValueChange={(value) => setFormData({ ...formData, documentOrigin: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le pays" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GA">Gabon</SelectItem>
                          <SelectItem value="FR">France</SelectItem>
                          <SelectItem value="US">États-Unis</SelectItem>
                          <SelectItem value="CA">Canada</SelectItem>
                          <SelectItem value="BE">Belgique</SelectItem>
                          <SelectItem value="OTHER">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="purpose">Motif de la légalisation *</Label>
                      <Textarea
                        id="purpose"
                        value={formData.purpose}
                        onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                        placeholder="Utilisation au Gabon, procédure administrative, etc."
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="urgency">Délai souhaité</Label>
                      <Select
                        value={formData.urgency}
                        onValueChange={(value) => setFormData({ ...formData, urgency: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal (3-5 jours ouvrés)</SelectItem>
                          <SelectItem value="urgent">Urgent - 24h (+50% tarif)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Téléphone *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <Button onClick={() => setStep(2)} className="w-full bg-purple-600 hover:bg-purple-700">
                      Continuer vers le téléchargement
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card>
                  <CardHeader>
                    <CardTitle>Téléchargement des documents</CardTitle>
                    <CardDescription>Téléchargez les documents à légaliser et les pièces justificatives</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="p-6 border-2 border-dashed border-purple-300 rounded-lg text-center hover:border-purple-500 transition-colors">
                      <Files className="h-12 w-12 mx-auto text-purple-500 mb-4" />
                      <h3 className="font-semibold mb-2">Documents à légaliser</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Téléchargez les {formData.documentCount} document(s) original(aux) scanné(s)
                      </p>
                      <Button variant="outline">
                        <Upload className="h-4 w-4 mr-2" />
                        Sélectionner les fichiers
                      </Button>
                    </div>

                    {requiredDocuments.slice(2).map((doc, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 border border-border rounded-lg hover:border-purple-300 transition-colors">
                        <div className="flex-1">
                          <p className="font-medium">{doc}</p>
                          <p className="text-sm text-muted-foreground">Format: PDF, JPG, PNG (max 5 Mo)</p>
                        </div>
                        <Button variant="outline" size="sm">
                          <Upload className="h-4 w-4 mr-2" />
                          Télécharger
                        </Button>
                      </div>
                    ))}

                    <div className="space-y-2">
                      <Label htmlFor="comments">Remarques additionnelles</Label>
                      <Textarea
                        id="comments"
                        value={formData.comments}
                        onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                        placeholder="Précisions sur les documents..."
                        rows={3}
                      />
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                      <Checkbox
                        id="terms"
                        checked={acceptTerms}
                        onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                      />
                      <label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                        Je certifie que les documents présentés sont authentiques et j'accepte les conditions générales du service de légalisation consulaire.
                      </label>
                    </div>

                    <div className="flex gap-4">
                      <Button variant="outline" onClick={() => setStep(1)}>
                        Retour
                      </Button>
                      <Button 
                        onClick={handleSubmit} 
                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                        disabled={!acceptTerms}
                      >
                        Soumettre la demande
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <Card className="text-center py-12">
                  <CardContent className="space-y-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Demande envoyée !</h2>
                      <p className="text-muted-foreground">
                        Votre demande de légalisation a été soumise avec succès.<br />
                        Numéro de référence: <strong>LEG-2024-{Math.random().toString(36).substr(2, 9).toUpperCase()}</strong>
                      </p>
                    </div>
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg text-sm text-amber-800 dark:text-amber-200">
                      <strong>Important :</strong> Les documents originaux doivent être déposés au consulat pour la légalisation finale.
                    </div>
                    <div className="flex gap-4 justify-center">
                      <Button variant="outline" asChild>
                        <Link to="/services">Retour aux services</Link>
                      </Button>
                      <Button className="bg-purple-600 hover:bg-purple-700" asChild>
                        <Link to="/dashboard/citizen/requests">Suivre ma demande</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stamp className="h-5 w-5 text-purple-600" />
                  Tarifs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pricingInfo.map((item, index) => (
                  <div key={index} className={`flex justify-between items-center ${index < pricingInfo.length - 1 ? 'pb-4 border-b' : ''}`}>
                    <span>{item.type}</span>
                    <span className="font-semibold">{item.price}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-purple-600" />
                  Délais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b">
                  <span>Traitement normal</span>
                  <span className="font-semibold">3-5 jours</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Traitement urgent</span>
                  <span className="font-semibold">24 heures</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  Documents acceptés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {documentTypes.slice(0, 6).map((type, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      {type.name}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200 dark:bg-purple-950/20 dark:border-purple-900/50">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-purple-600 shrink-0" />
                  <div>
                    <p className="font-medium text-purple-800 dark:text-purple-200">Apostille</p>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      Pour certains pays, une apostille peut être requise en plus de la légalisation consulaire.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
